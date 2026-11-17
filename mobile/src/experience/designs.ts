import type {brands} from "../brands";
export type ExperienceDesign={layout:string;bg:string;ink:string;accent:string;panel:string;muted:string;line:string;dark:boolean;kicker:string;headline:string;action:string;tabs:string[];steps:string[];radius:number;serif:boolean};
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
    "headline": "Every clause.\nAccounted for.",
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
    "serif": false
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
    "headline": "A longer horizon.",
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
    "serif": true
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
    "headline": "Build here.\nChoose wisely.",
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
    "serif": false
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
    "headline": "The winning bid\nstarts with fit.",
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
    "serif": false
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
    "headline": "Government,\nmade navigable.",
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
    "serif": false
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
    "headline": "Grow the team.\nSee the obligations.",
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
    "serif": false
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
    "headline": "Turn a dispute\ninto a clear case.",
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
    "serif": true
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
    "headline": "A better first\nconversation.",
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
    "serif": true
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
    "headline": "Make every\nword belong.",
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
    "serif": false
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
    "headline": "Care that moves\nthe case forward.",
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
    "serif": false
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
    "headline": "Know what\ncrosses next.",
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
    "serif": false
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
    "headline": "Look beyond\nthe résumé.",
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
    "serif": false
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
    "headline": "Belong from\nday one.",
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
    "serif": true
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
    "headline": "Make room\nfor what matters.",
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
    "serif": false
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
    "headline": "Work with\nyour energy.",
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
    "serif": true
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
    "headline": "Let your money\nreflect your values.",
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
    "serif": false
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
    "headline": "Good taste.\nBetter questions.",
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
    "serif": true
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
    "headline": "A home in order.\nA clearer ledger.",
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
    "serif": false
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
    "headline": "New city.\nA clear way in.",
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
    "serif": false
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
    "headline": "Less waste.\nMore possibility.",
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
    "serif": false
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
    "headline": "Come back\nto this moment.",
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
    "serif": false
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
    "headline": "This is not\nthe end of it.",
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
    "serif": false
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
    "headline": "Every place\nholds a story.",
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
    "serif": true
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
    "headline": "The city should\nopen for everyone.",
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
    "serif": false
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
    "headline": "Good food\ndeserves a next chapter.",
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
    "serif": true
  }
};
