import type {brands} from "../brands";
export type ExperienceDesign={layout:string;bg:string;ink:string;accent:string;panel:string;muted:string;line:string;dark:boolean;kicker:string;headline:string;action:string;tabs:string[];steps:string[];radius:number;serif:boolean;navigation:"drawer"|"floating"|"segmented"|"journey"|"compact";motion_ms:number;case_intro:string};
export const designs:Record<keyof typeof brands,ExperienceDesign>={
  "himayah": {
    "layout": "docket",
    "bg": "#091A29",
    "ink": "#F4F1E8",
    "accent": "#69E0B3",
    "panel": "#142E39",
    "muted": "#C4CDC7",
    "line": "#47584F",
    "dark": true,
    "kicker": "THE PRIVACY DESK",
    "headline": "Consent needs\na way back.",
    "action": "Review an agreement",
    "tabs": [
      "Docket",
      "Clauses",
      "Authorities",
      "Trail"
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
    "bg": "#F7F0E2",
    "ink": "#282318",
    "accent": "#7B5D14",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "YOUR UAE CHAPTER",
    "headline": "Eligibility before\nthe long-term plan.",
    "action": "Build my residency dossier",
    "tabs": [
      "Passport",
      "Dossier",
      "Criteria",
      "Journey"
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
    "bg": "#073D3B",
    "ink": "#F1F6EA",
    "accent": "#8AE3CF",
    "panel": "#164B45",
    "muted": "#C4CDC7",
    "line": "#47584F",
    "dark": true,
    "kicker": "THE FOUNDER’S DESK",
    "headline": "An activity changes\nthe cost picture.",
    "action": "Compare my setup options",
    "tabs": [
      "Desk",
      "Compare",
      "Rulebook",
      "Decisions"
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
    "bg": "#EAF0FC",
    "ink": "#132B58",
    "accent": "#2451C5",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "BID INTELLIGENCE",
    "headline": "A bid begins\nwith evidence.",
    "action": "Open a tender review",
    "tabs": [
      "Bid room",
      "Proposal",
      "RFP library",
      "Pipeline"
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
    "bg": "#F2F8FE",
    "ink": "#163F59",
    "accent": "#096A9B",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "ONE CLEAR NEXT STEP",
    "headline": "Start with the\nservice dependency.",
    "action": "Find my next service step",
    "tabs": [
      "Guide",
      "My request",
      "Service desk",
      "Progress"
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
    "bg": "#F3F5E7",
    "ink": "#1D382D",
    "accent": "#376844",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "WORKFORCE OPERATIONS",
    "headline": "Scope the team.\nThen the target.",
    "action": "Review my workforce plan",
    "tabs": [
      "Workforce",
      "Plan",
      "Policy",
      "Changes"
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
    "bg": "#F0E6DD",
    "ink": "#493024",
    "accent": "#984C29",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "THE TENANCY FILE",
    "headline": "A clear case\nstarts with dates.",
    "action": "Organize my tenancy evidence",
    "tabs": [
      "Case file",
      "Timeline",
      "RDC desk",
      "Case trail"
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
    "bg": "#191832",
    "ink": "#F2EFE9",
    "accent": "#C4B8FF",
    "panel": "#272541",
    "muted": "#C4CDC7",
    "line": "#47584F",
    "dark": true,
    "kicker": "GCC BUSINESS RELATIONS",
    "headline": "Origin belongs\nnext to the invoice.",
    "action": "Prepare my account brief",
    "tabs": [
      "Briefing",
      "Pitch",
      "Trade desk",
      "Outreach"
    ],
    "steps": [
      "Understand account",
      "Match approved facts",
      "Draft a proposal"
    ],
    "radius": 14,
    "serif": true,
    "navigation": "segmented",
    "motion_ms": 280,
    "case_intro": "The account’s needs and product facts you are authorized to use."
  },
  "adab": {
    "layout": "editorial",
    "bg": "#2B142E",
    "ink": "#FFF1EA",
    "accent": "#FFAC91",
    "panel": "#272541",
    "muted": "#C4CDC7",
    "line": "#47584F",
    "dark": true,
    "kicker": "THE CULTURAL EDITOR",
    "headline": "Privacy is part\nof cultural fit.",
    "action": "Review my campaign copy",
    "tabs": [
      "Studio",
      "Copy desk",
      "Standards",
      "Versions"
    ],
    "steps": [
      "Inspect claims",
      "Adapt expression",
      "Resolve flags"
    ],
    "radius": 4,
    "serif": false,
    "navigation": "segmented",
    "motion_ms": 280,
    "case_intro": "The original copy, approved claims and channel boundaries."
  },
  "khidmah": {
    "layout": "service",
    "bg": "#EAFAFD",
    "ink": "#123F4C",
    "accent": "#087B95",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "CUSTOMER CARE OPERATIONS",
    "headline": "Rights first.\nThe actual case next.",
    "action": "Open a customer resolution",
    "tabs": [
      "Care desk",
      "Resolve",
      "Rights",
      "Cases"
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
    "bg": "#111E2D",
    "ink": "#EDF4FF",
    "accent": "#FDBB65",
    "panel": "#272541",
    "muted": "#C4CDC7",
    "line": "#47584F",
    "dark": true,
    "kicker": "CROSS-BORDER CONTROL",
    "headline": "The declaration\nchanges the basis.",
    "action": "Review my shipment documents",
    "tabs": [
      "Manifest",
      "Clearance",
      "Customs",
      "Shipment log"
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
    "bg": "#DFEDE5",
    "ink": "#123E36",
    "accent": "#16675B",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "PEOPLE • EVIDENCE • FIT",
    "headline": "A contract is not\ncompetency evidence.",
    "action": "Map competency evidence",
    "tabs": [
      "Talent desk",
      "Evidence map",
      "Work rules",
      "Assessments"
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
    "bg": "#291F18",
    "ink": "#F9EDDD",
    "accent": "#E6B77E",
    "panel": "#272541",
    "muted": "#C4CDC7",
    "line": "#47584F",
    "dark": true,
    "kicker": "YOUR EXECUTIVE ARRIVAL",
    "headline": "Arrival is\na sequence.",
    "action": "Build my onboarding path",
    "tabs": [
      "Welcome",
      "Protocol",
      "Handbook",
      "Milestones"
    ],
    "steps": [
      "Map stakeholders",
      "Sequence tasks",
      "Resolve dependencies"
    ],
    "radius": 14,
    "serif": true,
    "navigation": "drawer",
    "motion_ms": 180,
    "case_intro": "Onboarding tasks, owners, due dates and dependencies."
  },
  "rafiq": {
    "layout": "orbit",
    "bg": "#141623",
    "ink": "#F6F1EA",
    "accent": "#FFAA72",
    "panel": "#272541",
    "muted": "#C4CDC7",
    "line": "#47584F",
    "dark": true,
    "kicker": "A DAY, WELL ARRANGED",
    "headline": "One event.\nSeveral local clocks.",
    "action": "Arrange my day",
    "tabs": [
      "Today",
      "Rhythm",
      "Time desk",
      "Agenda"
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
    "bg": "#221E43",
    "ink": "#F8F0D7",
    "accent": "#D9C282",
    "panel": "#272541",
    "muted": "#C4CDC7",
    "line": "#47584F",
    "dark": true,
    "kicker": "THE RAMADAN RHYTHM",
    "headline": "A rhythm needs\nreliable anchors.",
    "action": "Shape my Ramadan routine",
    "tabs": [
      "Rhythm",
      "Routine",
      "Guidance",
      "Reflections"
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
    "bg": "#08271F",
    "ink": "#F2F1DA",
    "accent": "#BDE7A0",
    "panel": "#272541",
    "muted": "#C4CDC7",
    "line": "#47584F",
    "dark": true,
    "kicker": "WEALTH WITH INTENTION",
    "headline": "Values begin\nwith a clear ledger.",
    "action": "Review my financial picture",
    "tabs": [
      "Balance",
      "My ledger",
      "Finance desk",
      "Decisions"
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
    "bg": "#F7EDE4",
    "ink": "#4C1C2B",
    "accent": "#9D3751",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "THE DINING EDITION",
    "headline": "Ask about allergens\nbefore the table.",
    "action": "Build my dining shortlist",
    "tabs": [
      "The edit",
      "Shortlist",
      "Food desk",
      "Saved tables"
    ],
    "steps": [
      "Set preferences",
      "Compare options",
      "Check dietary evidence"
    ],
    "radius": 14,
    "serif": true,
    "navigation": "segmented",
    "motion_ms": 280,
    "case_intro": "Your preferences, party size and the options to compare."
  },
  "manzil": {
    "layout": "receipt",
    "bg": "#FFF8E9",
    "ink": "#344C32",
    "accent": "#507447",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "THE HOUSEHOLD BOOK",
    "headline": "Household totals.\nTax questions apart.",
    "action": "Reconcile my household receipts",
    "tabs": [
      "Home book",
      "Receipts",
      "Tax desk",
      "Monthly trail"
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
    "bg": "#EDF6F2",
    "ink": "#163E40",
    "accent": "#177C7A",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "YOUR RELOCATION ATLAS",
    "headline": "Your move has\na dependency map.",
    "action": "Build my relocation plan",
    "tabs": [
      "Atlas",
      "Move plan",
      "Local desk",
      "Milestones"
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
    "bg": "#EAF4D8",
    "ink": "#274716",
    "accent": "#52751B",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "THE RESOURCE OBSERVATORY",
    "headline": "Compare periods.\nThen call it savings.",
    "action": "Understand my resource use",
    "tabs": [
      "Resources",
      "Usage",
      "Conservation",
      "Trends"
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
    "bg": "#EFF1E7",
    "ink": "#3F513D",
    "accent": "#4F6D43",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "A LITTLE SPACE FOR YOU",
    "headline": "A few minutes\ncan be a start.",
    "action": "Explore my wellbeing practice",
    "tabs": [
      "Pause",
      "Practice",
      "Field guide",
      "Reflections"
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
    "bg": "#F1E9DB",
    "ink": "#314531",
    "accent": "#327047",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "THE CIRCULAR ROUTE",
    "headline": "Sorting comes\nbefore routing.",
    "action": "Find my material route",
    "tabs": [
      "The loop",
      "Sort",
      "Local guidance",
      "Collections"
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
    "bg": "#F4E2CA",
    "ink": "#603821",
    "accent": "#914B24",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "THE LIVING HERITAGE JOURNAL",
    "headline": "Pearling shaped\na way of life.",
    "action": "Explore a heritage question",
    "tabs": [
      "Journal",
      "Explore",
      "Archive",
      "Learning trail"
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
    "bg": "#E9F0FE",
    "ink": "#152D5C",
    "accent": "#2156B4",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "ACCESS COMES FIRST",
    "headline": "Access needs\ncome first.",
    "action": "Plan my accessible journey",
    "tabs": [
      "Explore",
      "My route",
      "Access desk",
      "Journeys"
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
    "bg": "#FFF1CB",
    "ink": "#4E441D",
    "accent": "#7B651F",
    "panel": "#FFFFFF",
    "muted": "#5A685C",
    "line": "#D3D9CE",
    "dark": false,
    "kicker": "THE SURPLUS TABLE",
    "headline": "Surplus needs\na working handoff.",
    "action": "Prepare a food redistribution",
    "tabs": [
      "The table",
      "Match",
      "Food bank",
      "Handoffs"
    ],
    "steps": [
      "Describe surplus",
      "Check food conditions",
      "Prepare a recipient match"
    ],
    "radius": 28,
    "serif": true,
    "navigation": "compact",
    "motion_ms": 180,
    "case_intro": "The food, handling conditions and recipient capacity available."
  }
};
