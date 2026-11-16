/* Generated from mobile/src/setupComparison.ts; do not hand-edit. */
globalThis.IstithmarEngine=(()=>{const exports={};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIssue = setupIssue;
exports.compareSetup = compareSetup;
exports.formatCost = formatCost;
exports.taxScenario = taxScenario;
function decimal(value) {
    const [mantissa, exponent = '0'] = String(value).toLowerCase().split('e');
    const [whole, fraction = ''] = mantissa.split('.');
    let units = BigInt(whole + fraction), scale = fraction.length - Number(exponent);
    if (scale < 0) {
        units *= 10n ** BigInt(-scale);
        scale = 0;
    }
    return { units, scale };
}
const multiply = (a, b) => ({ units: a.units * b.units, scale: a.scale + b.scale });
function sum(values) {
    const scale = Math.max(...values.map(v => v.scale));
    return { units: values.reduce((n, v) => n + v.units * 10n ** BigInt(scale - v.scale), 0n), scale };
}
function plain(value) {
    if (!value.scale)
        return String(value.units);
    const text = String(value.units).padStart(value.scale + 1, '0');
    return (text.slice(0, -value.scale) + '.' + text.slice(-value.scale)).replace(/\.?0+$/, '');
}
function rounded(value) {
    const divisor = 10n ** BigInt(Math.max(0, value.scale - 2));
    const scaled = value.scale <= 2 ? value.units * 10n ** BigInt(2 - value.scale) : (value.units + divisor / 2n) / divisor;
    const digits = String(scaled).padStart(3, '0');
    return { total: digits.slice(0, -2) + '.' + digits.slice(-2), minor: String(scaled) };
}
const nonnegative = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
function setupIssue(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return 'Provide a comparison object.';
    const d = value;
    if (typeof d.activity !== 'string' || !d.activity.trim() || d.activity.length > 100000)
        return 'Provide a non-empty business activity.';
    if (typeof d.currency !== 'string' || !/^[A-Z]{3}$/.test(d.currency))
        return 'Use a three-letter uppercase currency code, such as AED.';
    if (!nonnegative(d.years))
        return 'Use a finite, non-negative comparison horizon in years.';
    if (!nonnegative(d.visas) || !Number.isSafeInteger(d.visas))
        return 'Use a non-negative whole number of visas within the safe integer range.';
    if (!Array.isArray(d.options) || d.options.length === 0)
        return 'Add at least one supplied setup option.';
    if (d.options.length > 500)
        return 'Use no more than 500 setup options.';
    const names = new Set();
    for (const value of d.options) {
        if (!value || typeof value !== 'object' || Array.isArray(value))
            return 'Each setup option must be an object.';
        const o = value;
        if (typeof o.name !== 'string' || !o.name.trim() || o.name.length > 100000)
            return 'Each option needs a non-empty name within 100,000 characters.';
        if (names.has(o.name))
            return 'Use unique option names so costs remain traceable.';
        names.add(o.name);
        for (const field of ['setup_fee', 'annual_fee', 'visa_fee'])
            if (!nonnegative(o[field]))
                return `${o.name}: ${field} must be a finite, non-negative number.`;
        if (!Array.isArray(o.activities) || o.activities.length > 500 || o.activities.some(a => typeof a !== 'string' || !a.trim() || a.length > 100000))
            return `${o.name}: supply non-empty activity names, up to 500 entries.`;
    }
    return null;
}
function compareSetup(value) {
    const issue = setupIssue(value);
    if (issue)
        throw new Error(issue);
    const d = value;
    const rows = d.options.map((o, index) => {
        const setup = decimal(o.setup_fee), recurring = multiply(decimal(o.annual_fee), decimal(d.years)), visas = multiply(decimal(o.visa_fee), decimal(d.visas));
        const amount = rounded(sum([setup, recurring, visas]));
        return { index, name: o.name, activity_match: o.activities.includes(d.activity), total: amount.total, total_minor: amount.minor,
            breakdown: { setup: plain(setup), recurring: plain(recurring), visas: plain(visas) }, activities: [...o.activities] };
    });
    rows.sort((a, b) => Number(b.activity_match) - Number(a.activity_match) || (BigInt(a.total_minor) < BigInt(b.total_minor) ? -1 : BigInt(a.total_minor) > BigInt(b.total_minor) ? 1 : a.index - b.index));
    return { currency: d.currency, years: d.years, visas: d.visas, activity: d.activity, comparison: rows.map(({ index: _, ...r }) => r),
        assumptions: 'Supplied figures and activity lists only. Setup + annual fee × years + per-visa fee × visa count. Final totals rounded half up to two decimal places; no live fee, permit, tax or currency-precision verification.' };
}
function formatCost(value) {
    const [whole, fraction] = value.split('.');
    return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (fraction === undefined ? '' : '.' + fraction);
}
/** User-defined single-bracket illustration; no default tax rate/threshold is supplied. */
function taxScenario(income, threshold, rate) {
    if (!nonnegative(income) || !nonnegative(threshold) || !nonnegative(rate) || rate > 100)
        throw new Error('Supply finite, non-negative income and threshold, and a rate from 0 to 100.');
    const a = decimal(income), b = decimal(threshold), scale = Math.max(a.scale, b.scale);
    const difference = a.units * 10n ** BigInt(scale - a.scale) - b.units * 10n ** BigInt(scale - b.scale);
    const excess = { units: difference > 0n ? difference : 0n, scale };
    const fraction = decimal(rate);
    fraction.scale += 2;
    return { tax: rounded(multiply(excess, fraction)).total, taxable_excess: plain(excess) };
}

return exports;})();
