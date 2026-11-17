import type {brands} from '../brands';
export interface CaseSection {title:string;fields:string[]}
export const caseForms:Record<keyof typeof brands,{mode:'editor'|'journey'|'board'|'ledger'|'timeline'|'comparison'|'notebook';sections:CaseSection[]}>={
 himayah:{mode:'editor',sections:[{title:'Agreement under examination',fields:['text']},{title:'Clause review rules',fields:['rules']}]},
 iqamah:{mode:'journey',sections:[{title:'Dossier reference date',fields:['as_of']},{title:'Selected residency route',fields:['requirements']},{title:'Documents in hand',fields:['documents']}]},
 istithmar:{mode:'comparison',sections:[{title:'Business brief',fields:['activity','currency']},{title:'Planning horizon',fields:['years','visas']},{title:'Jurisdictions to compare',fields:['options']}]},
 munagasah:{mode:'board',sections:[{title:'Tender clock',fields:['deadline','as_of']},{title:'What the buyer requires',fields:['requirements']},{title:'What we can evidence',fields:['capabilities']}]},
 sahil:{mode:'journey',sections:[{title:'Service checkpoint',fields:['as_of']},{title:'What the service asks for',fields:['requirements']},{title:'What you already have',fields:['documents']}]},
 tawteen:{mode:'comparison',sections:[{title:'Target basis',fields:['target_percent']},{title:'Active workforce register',fields:['employees']}]},
 adl:{mode:'timeline',sections:[{title:'Case currency',fields:['currency']},{title:'What happened, and when',fields:['events']},{title:'Amounts being claimed',fields:['claims']}]},
 tawassul:{mode:'editor',sections:[{title:'The account',fields:['account']},{title:'Needs to address',fields:['needs']},{title:'Facts we can stand behind',fields:['products']}]},
 adab:{mode:'editor',sections:[{title:'The original expression',fields:['copy']},{title:'Claims and approved language',fields:['claims','approved_claims']},{title:'Editorial boundaries',fields:['prohibited_terms','max_characters']}]},
 khidmah:{mode:'journey',sections:[{title:'The customer situation',fields:['reason','purchase_date','as_of']},{title:'The resolution amount',fields:['amount','refund_limit']},{title:'The merchant policy',fields:['return_window_days','eligible_reasons']}]},
 jomrok:{mode:'board',sections:[{title:'Cargo manifest',fields:['shipment','required_fields']},{title:'Declared valuation',fields:['goods_value','freight','currency']},{title:'Supplied duty basis',fields:['duty_rate_percent']}]},
 khibrat:{mode:'comparison',sections:[{title:'The role’s competency rubric',fields:['criteria']},{title:'What the candidate demonstrates',fields:['evidence']}]},
 majlis:{mode:'notebook',sections:[{title:'Arrival reference date',fields:['as_of']},{title:'The executive onboarding book',fields:['tasks']}]},
 rafiq:{mode:'timeline',sections:[{title:'Your available day',fields:['start','end','buffer_minutes']},{title:'Already committed',fields:['busy']},{title:'What deserves a place',fields:['tasks']}]},
 sawm:{mode:'notebook',sections:[{title:'The day’s boundaries',fields:['start','end','buffer_minutes']},{title:'Protected commitments and rest',fields:['busy']},{title:'Work to arrange',fields:['tasks']}]},
 mizan:{mode:'ledger',sections:[{title:'Your accounting currency',fields:['currency']},{title:'Intentional spending categories',fields:['budgets']},{title:'Transaction evidence',fields:['transactions']}]},
 thawg:{mode:'comparison',sections:[{title:'The table',fields:['budget','party_size']},{title:'What matters for this meal',fields:['required_tags']},{title:'Places under consideration',fields:['restaurants']}]},
 manzil:{mode:'ledger',sections:[{title:'The household currency',fields:['currency']},{title:'The family’s spending plan',fields:['budgets']},{title:'Receipt intake',fields:['transactions']}]},
 gurbah:{mode:'journey',sections:[{title:'Where the move stands today',fields:['as_of']},{title:'The relocation dependency map',fields:['tasks']}]},
 'amanah-eco':{mode:'comparison',sections:[{title:'Measurement basis',fields:['unit']},{title:'Previous reading period',fields:['previous_usage','previous_days']},{title:'Current reading period',fields:['current_usage','current_days']}]},
 nafas:{mode:'notebook',sections:[{title:'A gentle starting point',fields:['start_date','days']},{title:'Practices you want to explore',fields:['preferred_activities']}]},
 tadweer:{mode:'journey',sections:[{title:'What needs a next life',fields:['material','hazardous']},{title:'Available collection routes',fields:['routes']}]},
 turath:{mode:'notebook',sections:[{title:'The stories to follow',fields:['topics']},{title:'The source archive',fields:['sources']}]},
 himam:{mode:'board',sections:[{title:'Access requirements first',fields:['needs']},{title:'Routes and barrier evidence',fields:['routes']}]},
 hisad:{mode:'board',sections:[{title:'The handling checkpoint',fields:['as_of']},{title:'Food available for redistribution',fields:['lot']},{title:'Who can receive it',fields:['recipients']}]}
};
