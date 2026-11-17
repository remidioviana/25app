import type {brands} from "../brands";
export type ExperienceDesign={layout:string;bg:string;ink:string;accent:string;panel:string;muted:string;line:string;dark:boolean;kicker:string;headline:string;action:string;tabs:string[];steps:string[];radius:number;serif:boolean;navigation:"drawer"|"floating"|"segmented"|"journey"|"compact";motion_ms:number;case_intro:string};
export const designs:Record<keyof typeof brands,ExperienceDesign>={
  "himayah": {
    "layout": "docket",
    "bg": "#151E37",
    "ink": "#F4E7D5",
    "accent": "#E7695E",
    "panel": "#212940",
    "muted": "#C7BFB5",
    "line": "#585A66",
    "dark": true,
    "kicker": "THE PRIVACY DESK",
    "headline": "Consent needs\na way back.",
    "action": "Review an agreement",
    "tabs": [
      "Docket",
      "Clauses",
      "Authorities",
      "Trail",
      "Inspector"
    ],
    "steps": [
      "Import agreement",
      "Trace obligations",
      "Resolve findings"
    ],
    "radius": 4,
    "serif": false,
    "navigation": "drawer",
    "motion_ms": 180,
    "case_intro": "Agreement text and clause rules form the case file."
  },
  "iqamah": {
    "layout": "passport",
    "bg": "#F7EBD7",
    "ink": "#502C43",
    "accent": "#825C4E",
    "panel": "#EEE0CF",
    "muted": "#715261",
    "line": "#C5B2AB",
    "dark": false,
    "kicker": "YOUR UAE CHAPTER",
    "headline": "Eligibility before\nthe long-term plan.",
    "action": "Build my residency dossier",
    "tabs": [
      "Passport",
      "Dossier",
      "Criteria",
      "Journey",
      "Folio"
    ],
    "steps": [
      "Choose a route",
      "Gather evidence",
      "Prepare dossier"
    ],
    "radius": 28,
    "serif": true,
    "navigation": "floating",
    "motion_ms": 280,
    "case_intro": "A selected route, a dated checklist and the documents you hold."
  },
  "istithmar": {
    "layout": "decision",
    "bg": "#133C67",
    "ink": "#DDF8ED",
    "accent": "#60C6AC",
    "panel": "#1E466E",
    "muted": "#B5D2D2",
    "line": "#50748F",
    "dark": true,
    "kicker": "THE FOUNDER\u2019S DESK",
    "headline": "An activity changes\nthe cost picture.",
    "action": "Compare my setup options",
    "tabs": [
      "Desk",
      "Compare",
      "Rulebook",
      "Decisions",
      "Cost horizon"
    ],
    "steps": [
      "Define activity",
      "Compare jurisdictions",
      "Map setup costs"
    ],
    "radius": 14,
    "serif": false,
    "navigation": "segmented",
    "motion_ms": 280,
    "case_intro": "Business activity, jurisdiction options and documented costs."
  },
  "munagasah": {
    "layout": "blueprint",
    "bg": "#282A2F",
    "ink": "#FFBE59",
    "accent": "#F4F2EC",
    "panel": "#343231",
    "muted": "#D4A051",
    "line": "#68563C",
    "dark": true,
    "kicker": "BID INTELLIGENCE",
    "headline": "A bid begins\nwith evidence.",
    "action": "Open a tender review",
    "tabs": [
      "Bid room",
      "Proposal",
      "RFP library",
      "Pipeline",
      "Bid control"
    ],
    "steps": [
      "Read requirements",
      "Match capabilities",
      "Build proposal"
    ],
    "radius": 4,
    "serif": false,
    "navigation": "drawer",
    "motion_ms": 180,
    "case_intro": "Tender requirements and your supporting capability statements."
  },
  "sahil": {
    "layout": "concierge",
    "bg": "#F8F7F1",
    "ink": "#166360",
    "accent": "#307773",
    "panel": "#ECEFE9",
    "muted": "#337673",
    "line": "#B4CBC6",
    "dark": false,
    "kicker": "ONE CLEAR NEXT STEP",
    "headline": "Start with the\nservice dependency.",
    "action": "Find my next service step",
    "tabs": [
      "Guide",
      "My request",
      "Service desk",
      "Progress",
      "Next step"
    ],
    "steps": [
      "Identify service",
      "Find requirements",
      "Prepare next step"
    ],
    "radius": 28,
    "serif": false,
    "navigation": "journey",
    "motion_ms": 240,
    "case_intro": "The service you need and the documents already available."
  },
  "tawteen": {
    "layout": "workforce",
    "bg": "#F1CAB1",
    "ink": "#1F4945",
    "accent": "#325C57",
    "panel": "#E5C3AB",
    "muted": "#3C5B54",
    "line": "#B2A391",
    "dark": false,
    "kicker": "WORKFORCE OPERATIONS",
    "headline": "Scope the team.\nThen the target.",
    "action": "Review my workforce plan",
    "tabs": [
      "Workforce",
      "Plan",
      "Policy",
      "Changes",
      "Scenarios"
    ],
    "steps": [
      "Load workforce",
      "Check target basis",
      "Model hiring options"
    ],
    "radius": 14,
    "serif": false,
    "navigation": "compact",
    "motion_ms": 180,
    "case_intro": "Active workforce records and the target you want evaluated."
  },
  "adl": {
    "layout": "casefile",
    "bg": "#E3D7E9",
    "ink": "#3C283B",
    "accent": "#705162",
    "panel": "#DACDDF",
    "muted": "#5D4B5E",
    "line": "#B1A2B5",
    "dark": false,
    "kicker": "THE TENANCY FILE",
    "headline": "A clear case\nstarts with dates.",
    "action": "Organize my tenancy evidence",
    "tabs": [
      "Case file",
      "Timeline",
      "RDC desk",
      "Case trail",
      "Chronology"
    ],
    "steps": [
      "Build timeline",
      "Reconcile amounts",
      "Find evidence gaps"
    ],
    "radius": 4,
    "serif": true,
    "navigation": "journey",
    "motion_ms": 240,
    "case_intro": "A dated sequence of tenancy events, amounts and references."
  },
  "tawassul": {
    "layout": "correspondence",
    "bg": "#123D32",
    "ink": "#EDE4CD",
    "accent": "#CAA370",
    "panel": "#1E463B",
    "muted": "#C1C3AE",
    "line": "#546F60",
    "dark": true,
    "kicker": "GCC BUSINESS RELATIONS",
    "headline": "Origin belongs\nnext to the invoice.",
    "action": "Prepare my account brief",
    "tabs": [
      "Briefing",
      "Pitch",
      "Trade desk",
      "Outreach",
      "Fact map"
    ],
    "steps": [
      "Understand account",
      "Match approved facts",
      "Draft a proposal"
    ],
    "radius": 14,
    "serif": false,
    "navigation": "segmented",
    "motion_ms": 280,
    "case_intro": "The account\u2019s needs and product facts you are authorized to use."
  },
  "adab": {
    "layout": "editorial",
    "bg": "#782859",
    "ink": "#F9DAE0",
    "accent": "#D6B0FC",
    "panel": "#7F3260",
    "muted": "#DFB6C5",
    "line": "#9F5D82",
    "dark": true,
    "kicker": "THE CULTURAL EDITOR",
    "headline": "Privacy is part\nof cultural fit.",
    "action": "Review my campaign copy",
    "tabs": [
      "Studio",
      "Copy desk",
      "Standards",
      "Versions",
      "Storyboard"
    ],
    "steps": [
      "Inspect claims",
      "Adapt expression",
      "Resolve flags"
    ],
    "radius": 4,
    "serif": true,
    "navigation": "segmented",
    "motion_ms": 280,
    "case_intro": "The original copy, approved claims and channel boundaries."
  },
  "khidmah": {
    "layout": "service",
    "bg": "#FFF5CC",
    "ink": "#225B74",
    "accent": "#317383",
    "panel": "#F3EDC7",
    "muted": "#417180",
    "line": "#BDC7B2",
    "dark": false,
    "kicker": "CUSTOMER CARE OPERATIONS",
    "headline": "Rights first.\nThe actual case next.",
    "action": "Open a customer resolution",
    "tabs": [
      "Care desk",
      "Resolve",
      "Rights",
      "Cases",
      "Resolution"
    ],
    "steps": [
      "Understand issue",
      "Check policy",
      "Prepare resolution"
    ],
    "radius": 28,
    "serif": false,
    "navigation": "compact",
    "motion_ms": 180,
    "case_intro": "The transaction, customer issue, policy and resolution authority."
  },
  "jomrok": {
    "layout": "manifest",
    "bg": "#F4F3ED",
    "ink": "#1645AE",
    "accent": "#78627C",
    "panel": "#E8E9EA",
    "muted": "#4066BA",
    "line": "#B1BFDA",
    "dark": false,
    "kicker": "CROSS-BORDER CONTROL",
    "headline": "The declaration\nchanges the basis.",
    "action": "Review my shipment documents",
    "tabs": [
      "Manifest",
      "Clearance",
      "Customs",
      "Shipment log",
      "Cargo route"
    ],
    "steps": [
      "Read shipment",
      "Check declarations",
      "Identify missing records"
    ],
    "radius": 4,
    "serif": false,
    "navigation": "drawer",
    "motion_ms": 180,
    "case_intro": "Shipment facts, document references and supplied rates."
  },
  "khibrat": {
    "layout": "competency",
    "bg": "#34312D",
    "ink": "#D9E14D",
    "accent": "#F1EEE5",
    "panel": "#3D3B2F",
    "muted": "#B8BE47",
    "line": "#666637",
    "dark": true,
    "kicker": "PEOPLE \u2022 EVIDENCE \u2022 FIT",
    "headline": "A contract is not\ncompetency evidence.",
    "action": "Map competency evidence",
    "tabs": [
      "Talent desk",
      "Evidence map",
      "Work rules",
      "Assessments",
      "Criterion lens"
    ],
    "steps": [
      "Define rubric",
      "Locate evidence",
      "Expose skill gaps"
    ],
    "radius": 14,
    "serif": false,
    "navigation": "segmented",
    "motion_ms": 280,
    "case_intro": "A role rubric and candidate evidence linked to actual records."
  },
  "majlis": {
    "layout": "protocol",
    "bg": "#F5EBE9",
    "ink": "#403A78",
    "accent": "#6A5C9A",
    "panel": "#EBE1E3",
    "muted": "#645D8F",
    "line": "#BFB6C7",
    "dark": false,
    "kicker": "YOUR EXECUTIVE ARRIVAL",
    "headline": "Arrival is\na sequence.",
    "action": "Build my onboarding path",
    "tabs": [
      "Welcome",
      "Protocol",
      "Handbook",
      "Milestones",
      "Task map"
    ],
    "steps": [
      "Map stakeholders",
      "Sequence tasks",
      "Resolve dependencies"
    ],
    "radius": 14,
    "serif": false,
    "navigation": "drawer",
    "motion_ms": 180,
    "case_intro": "Onboarding tasks, owners, due dates and dependencies."
  },
  "rafiq": {
    "layout": "orbit",
    "bg": "#F9EEE8",
    "ink": "#5C4D7E",
    "accent": "#795E84",
    "panel": "#F0E5E2",
    "muted": "#6F608B",
    "line": "#CABEC8",
    "dark": false,
    "kicker": "A DAY, WELL ARRANGED",
    "headline": "One event.\nSeveral local clocks.",
    "action": "Arrange my day",
    "tabs": [
      "Today",
      "Rhythm",
      "Time desk",
      "Agenda",
      "Day ribbon"
    ],
    "steps": [
      "Set priorities",
      "Fit commitments",
      "Keep breathing room"
    ],
    "radius": 14,
    "serif": false,
    "navigation": "floating",
    "motion_ms": 280,
    "case_intro": "Your commitments, timezone, priorities and available window."
  },
  "sawm": {
    "layout": "ritual",
    "bg": "#131F4D",
    "ink": "#FFE8B0",
    "accent": "#D0B87C",
    "panel": "#202A52",
    "muted": "#D0C09C",
    "line": "#5A5B6B",
    "dark": true,
    "kicker": "THE RAMADAN RHYTHM",
    "headline": "A rhythm needs\nreliable anchors.",
    "action": "Shape my Ramadan routine",
    "tabs": [
      "Rhythm",
      "Routine",
      "Guidance",
      "Reflections",
      "Day rhythm"
    ],
    "steps": [
      "Choose work windows",
      "Reserve rest",
      "Balance commitments"
    ],
    "radius": 28,
    "serif": true,
    "navigation": "floating",
    "motion_ms": 280,
    "case_intro": "Work periods, rest preferences and the limits of your day."
  },
  "mizan": {
    "layout": "balance",
    "bg": "#143C32",
    "ink": "#EFF1E4",
    "accent": "#9DCA9C",
    "panel": "#20463C",
    "muted": "#C3CDC0",
    "line": "#567267",
    "dark": true,
    "kicker": "WEALTH WITH INTENTION",
    "headline": "Values begin\nwith a clear ledger.",
    "action": "Review my financial picture",
    "tabs": [
      "Balance",
      "My ledger",
      "Finance desk",
      "Decisions",
      "Ledger audit"
    ],
    "steps": [
      "Bring transactions",
      "Reconcile spending",
      "Explore next steps"
    ],
    "radius": 14,
    "serif": false,
    "navigation": "compact",
    "motion_ms": 180,
    "case_intro": "Transactions, categories and the budgets you want reconciled."
  },
  "thawg": {
    "layout": "menu",
    "bg": "#FFF0D8",
    "ink": "#963728",
    "accent": "#596A80",
    "panel": "#F9E6CE",
    "muted": "#A44F3F",
    "line": "#E0B8A3",
    "dark": false,
    "kicker": "THE DINING EDITION",
    "headline": "Ask about allergens\nbefore the table.",
    "action": "Build my dining shortlist",
    "tabs": [
      "The edit",
      "Shortlist",
      "Food desk",
      "Saved tables",
      "Food checks"
    ],
    "steps": [
      "Set preferences",
      "Compare options",
      "Check dietary evidence"
    ],
    "radius": 14,
    "serif": false,
    "navigation": "segmented",
    "motion_ms": 280,
    "case_intro": "Your preferences, party size and the options to compare."
  },
  "manzil": {
    "layout": "receipt",
    "bg": "#FBE5D5",
    "ink": "#42275A",
    "accent": "#7E5774",
    "panel": "#F1DBCE",
    "muted": "#674D73",
    "line": "#C4ACB0",
    "dark": false,
    "kicker": "THE HOUSEHOLD BOOK",
    "headline": "Household totals.\nTax questions apart.",
    "action": "Reconcile my household receipts",
    "tabs": [
      "Home book",
      "Receipts",
      "Tax desk",
      "Monthly trail",
      "Reconcile"
    ],
    "steps": [
      "Bring receipts",
      "Check duplicates",
      "Reconcile totals"
    ],
    "radius": 4,
    "serif": false,
    "navigation": "segmented",
    "motion_ms": 280,
    "case_intro": "Receipt identifiers, amounts, categories and verification state."
  },
  "gurbah": {
    "layout": "journey",
    "bg": "#FFF2DB",
    "ink": "#273B63",
    "accent": "#7A6557",
    "panel": "#F3E8D4",
    "muted": "#52607B",
    "line": "#BEBBB7",
    "dark": false,
    "kicker": "YOUR RELOCATION ATLAS",
    "headline": "Your move has\na dependency map.",
    "action": "Build my relocation plan",
    "tabs": [
      "Atlas",
      "Move plan",
      "Local desk",
      "Milestones",
      "Move atlas"
    ],
    "steps": [
      "Map requirements",
      "Order dependencies",
      "Prepare arrival"
    ],
    "radius": 14,
    "serif": false,
    "navigation": "journey",
    "motion_ms": 240,
    "case_intro": "Your move date, required tasks and what depends on what."
  },
  "amanah-eco": {
    "layout": "resource",
    "bg": "#F8F8DA",
    "ink": "#215B39",
    "accent": "#43763E",
    "panel": "#ECEFD1",
    "muted": "#437453",
    "line": "#B8C9AA",
    "dark": false,
    "kicker": "THE RESOURCE OBSERVATORY",
    "headline": "Compare periods.\nThen call it savings.",
    "action": "Understand my resource use",
    "tabs": [
      "Resources",
      "Usage",
      "Conservation",
      "Trends",
      "Energy flow"
    ],
    "steps": [
      "Add readings",
      "Normalize periods",
      "Find practical savings"
    ],
    "radius": 14,
    "serif": false,
    "navigation": "compact",
    "motion_ms": 180,
    "case_intro": "Meter readings and the dates that define each comparison period."
  },
  "nafas": {
    "layout": "breathing",
    "bg": "#F0F4F1",
    "ink": "#3C5B64",
    "accent": "#516E74",
    "panel": "#E6ECE9",
    "muted": "#526D75",
    "line": "#BAC6C7",
    "dark": false,
    "kicker": "A LITTLE SPACE FOR YOU",
    "headline": "A few minutes\ncan be a start.",
    "action": "Explore my wellbeing practice",
    "tabs": [
      "Pause",
      "Activities",
      "Reflections",
      "Planning",
      "Breathing"
    ],
    "steps": [
      "Name the moment",
      "Choose a practice",
      "Make space to reflect"
    ],
    "radius": 28,
    "serif": false,
    "navigation": "floating",
    "motion_ms": 280,
    "case_intro": "The context you choose to share and the practice you want to explore."
  },
  "tadweer": {
    "layout": "circular",
    "bg": "#F7F2E3",
    "ink": "#8E3E1F",
    "accent": "#1F3942",
    "panel": "#F1E8D8",
    "muted": "#9C5538",
    "line": "#D7BCA8",
    "dark": false,
    "kicker": "THE CIRCULAR ROUTE",
    "headline": "Sorting comes\nbefore routing.",
    "action": "Find my material route",
    "tabs": [
      "The loop",
      "Sort",
      "Local guidance",
      "Collections",
      "Materials"
    ],
    "steps": [
      "Identify material",
      "Separate risks",
      "Plan the next handoff"
    ],
    "radius": 14,
    "serif": false,
    "navigation": "compact",
    "motion_ms": 180,
    "case_intro": "Materials, handling risks and the collection rules you know."
  },
  "turath": {
    "layout": "story",
    "bg": "#F6F1E7",
    "ink": "#65533C",
    "accent": "#77664E",
    "panel": "#EEE8DE",
    "muted": "#766651",
    "line": "#CAC2B4",
    "dark": false,
    "kicker": "THE LIVING HERITAGE JOURNAL",
    "headline": "Pearling shaped\na way of life.",
    "action": "Explore a heritage question",
    "tabs": [
      "Journal",
      "Explore",
      "Archive",
      "Learning trail",
      "Source folios"
    ],
    "steps": [
      "Choose a subject",
      "Follow sources",
      "Connect the stories"
    ],
    "radius": 4,
    "serif": true,
    "navigation": "drawer",
    "motion_ms": 180,
    "case_intro": "The place, period or cultural question you want to understand."
  },
  "himam": {
    "layout": "wayfinding",
    "bg": "#FFFCE8",
    "ink": "#10358C",
    "accent": "#66706C",
    "panel": "#F2F1E3",
    "muted": "#405D9E",
    "line": "#B7C0CC",
    "dark": false,
    "kicker": "ACCESS COMES FIRST",
    "headline": "Access needs\ncome first.",
    "action": "Plan my accessible journey",
    "tabs": [
      "Explore",
      "My route",
      "Access desk",
      "Journeys",
      "Barriers"
    ],
    "steps": [
      "Define access needs",
      "Review route evidence",
      "Check unresolved barriers"
    ],
    "radius": 14,
    "serif": false,
    "navigation": "journey",
    "motion_ms": 240,
    "case_intro": "Your access requirements and the route evidence available."
  },
  "hisad": {
    "layout": "harvest",
    "bg": "#FCF3E4",
    "ink": "#943A38",
    "accent": "#A5533D",
    "panel": "#F6E9DB",
    "muted": "#A2524E",
    "line": "#DDBCB0",
    "dark": false,
    "kicker": "THE SURPLUS TABLE",
    "headline": "Surplus needs\na working handoff.",
    "action": "Prepare a food redistribution",
    "tabs": [
      "The table",
      "Match",
      "Food bank",
      "Handoffs",
      "Capacity"
    ],
    "steps": [
      "Describe surplus",
      "Check food conditions",
      "Prepare a recipient match"
    ],
    "radius": 28,
    "serif": false,
    "navigation": "compact",
    "motion_ms": 180,
    "case_intro": "The food, handling conditions and recipient capacity available."
  }
};
