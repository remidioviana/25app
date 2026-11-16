"""Reproducible vector-led brand assets. No stock, landscape or AI-generated imagery."""
import json
from pathlib import Path
from html import escape
import subprocess
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[1]
rows='''himayah|Himayah AI|The UAE Compliance Shield|#0B192C|#10B981|GovTech|Legal teams|Privacy review|shield
 iqamah|Iqamah AI|The Golden Visa Procurer|#D4AF37|#111827|GovTech|Visa applicants|Dossier readiness|crest
 istithmar|Istithmar AI|The Free Zone & Tax Navigator|#0D9488|#1E293B|GovTech|Business founders|Business setup|skyline
 munagasah|Munagasah AI|The Gov-Tender Proposal Writer|#1D4ED8|#F8FAFC|GovTech|Bid managers|Tender workspace|document
 sahil|Sahil AI|The E-Gov Interface Simplifier|#0284C7|#FAF8F5|GovTech|Residents|Service guide|wave
 tawteen|Tawteen AI|The Emiratisation Compliance Monitor|#047857|#DC2626|GovTech|Workforce managers|Workforce planning|people
 adl|Adl AI|The RERA Property Dispute Agent|#B45309|#18181B|GovTech|Tenants and landlords|Dispute timeline|arch
 tawassul|Tawassul B2B|The GCC Market Gateway|#4338CA|#F3E8D2|Enterprise|GCC sales leaders|Pitch studio|star
 adab|Adab AI|The Cultural Marketing Copy Adapter|#7E22CE|#F59E0B|Enterprise|Marketing teams|Copy review|nib
 khidmah|Khidmah AI|The Automated Khaleeji Care Agent|#2563EB|#F1F5F9|Enterprise|Customer care teams|Refund desk|lantern
 jomrok|Jomrok AI|The GCC Cross-Border Customs Agent|#0369A1|#D97706|Enterprise|Trade operators|Shipment review|cargo
 khibrat|Khibrat AI|The Intelligent Arabic CV Screener|#115E59|#F43F5E|Enterprise|Recruiters|Competency evidence|diamond
 majlis|Majlis AI|The Corporate Onboarding Companion|#451A03|#D97706|Enterprise|New executives|Protocol guide|dome
 rafiq|Rafiq|The Premium Khaleeji Lifestyle Agent|#0F172A|#F97316|Lifestyle|Busy residents|Daily rhythm|clock
 sawm|Sawm AI|The Ramadan Productivity Coach|#312E81|#FACC15|Lifestyle|Fasting professionals|Energy planner|crescent
 mizan|Mizan AI|The Sharia-Compliant Wealth Mentor|#059669|#FEFCE8|Lifestyle|Values-led households|Wealth overview|scales
 thawg|Thawg AI|The High-End Gastronomy & Halal Auditor|#881337|#EAB308|Lifestyle|Dining guests|Dining shortlist|cloche
 manzil|Manzil AI|The Family Expense Arabic Tracker|#166534|#FFFBEB|Lifestyle|Families|Household ledger|home
 gurbah|Gurbah AI|The Expat Relocation Companion|#0F766E|#FEF3C7|Lifestyle|Relocating families|Move command center|key
 amanah-eco|Amanah Eco|The Green-Citizen Multimodal Node|#15803D|#0EA5E9|Impact|Households|Resource insights|leaf
 nafas|Nafas AI|The Arabic Mental Wellbeing Companion|#4D7C0F|#F7FEE7|Impact|Mindful residents|Breathing space|lotus
 tadweer|Tadweer AI|The Community Waste & Recycling Router|#047857|#78350F|Impact|Community recyclers|Material routing|recycle
 turath|Turath AI|The Local Heritage Educational Tutor|#9A3412|#0D9488|Impact|Curious learners|Heritage trail|falcon
 himam|Himam AI|The Accessible Dubai Mobility Agent|#1E40AF|#F59E0B|Impact|People of Determination|Accessible journeys|access
 hisad|Hisad AI|The Food Security & Waste Mitigation Agent|#CA8A04|#3F6212|Impact|Food rescue teams|Rescue board|wheat'''
shapes={
'shield':'<path d="M128 35 207 67v65q0 55-79 91-79-36-79-91V67Z"/><path d="M128 77v95m-42 0h84M83 102h90M89 102l-22 42h44ZM166 102l-22 42h44Z"/>',
'crest':'<path d="m128 45 77 40-32 64-45 61-45-61-32-64 77 30Z"/><rect x="102" y="101" width="52" height="78" rx="8"/><circle cx="128" cy="130" r="13"/><path d="M113 158h30"/>',
'skyline':'<path d="M47 190V95h35v95m8 0V59h42v131m9 0v-75h42v75M36 201h181"/><path d="m177 45 24 24-24 24-24-24Zm0 8v32m-16-16h32"/>',
'document':'<path d="M65 36h84l42 44v140H65Z M149 36v44h42M88 106h45m-45 27h35m-35 27h24"/><path d="m130 176 47-47m-31 0h31v31"/>',
'wave':'<path d="M36 98q46-72 92 0t92 0M36 150q46-72 92 0t92 0"/><circle cx="53" cy="189" r="12"/><circle cx="202" cy="56" r="12"/><path d="m62 180 132-115"/>',
'people':'<circle cx="91" cy="74" r="24"/><circle cx="168" cy="74" r="24"/><path d="M40 173v-33q51-52 102 0v33m-29-33q47-52 94 0v33"/><path d="m128 139 34 14v30q0 22-34 38-34-16-34-38v-30Z"/>',
'arch':'<path d="M49 211V116a79 79 0 0 1 158 0v95M84 211V116a44 44 0 0 1 88 0v95M128 100v83m-42 0h84M82 128h92m-83 0-20 33h40Zm74 0-20 33h40Z"/>',
'star':'<path d="m128 35 25 50 54-7-7 54 25 21-50 25 7 42-54-25-54 25 7-42-50-25 25-21-7-54 54 7Z"/><path d="M75 153q53-75 106 0M75 153h106m-80-35v35m54-35v35"/>',
'nib':'<path d="m65 205 22-88 75-75 49 49-75 75-71 39Zm0 0 59-59m-37-29 49 49"/><circle cx="128" cy="142" r="10"/><path d="M54 43v42M33 64h42m119 105v42m-21-21h42"/>',
'lantern':'<path d="M82 59h92l25 44-20 107H77L57 103Zm13 0V43h66v16M57 103h142"/><path d="M128 180q-57-34-26-60 16-10 26 9 10-19 26-9 31 26-26 60Z"/>',
'cargo':'<rect x="38" y="121" width="178" height="91" rx="8"/><path d="M67 137v57m31-57v57m31-57v57m31-57v57m31-57v57"/><path d="M68 105a62 62 0 1 1 120 0M67 75h122m-61-62q-38 42-17 92m17-92q38 42 17 92"/>',
'diamond':'<path d="m128 34 88 94-88 94-88-94Zm0 0v188M40 128h176"/><circle cx="90" cy="128" r="11"/><circle cx="164" cy="128" r="11"/><circle cx="128" cy="85" r="11"/><circle cx="128" cy="170" r="11"/>',
'dome':'<path d="M35 130q93-146 186 0Zm25 0v77h136v-77m-160 78h184M128 24v22"/><path d="M107 146h42v34q-21 25-42 0Zm42 5h13q17 17-13 28"/>',
'clock':'<path d="M116 37a91 91 0 1 0 103 105A83 83 0 0 1 116 37Z"/><circle cx="158" cy="96" r="46"/><path d="M158 65v33l20 13"/>',
'crescent':'<path d="M128 35a94 94 0 1 0 91 116 83 83 0 0 1-91-116Z"/><path d="m107 128 24-32 22 54 24-34h39"/>',
'scales':'<path d="M128 64v132m-48 0h96M62 100h132m-116 0-27 57h54Zm100 0-27 57h54Z"/><path d="M128 83q-5-57 55-57 0 57-55 57Zm0 0 38-38"/>',
'cloche':'<path d="M42 183h172M57 170a71 71 0 0 1 142 0Zm71-71V86m-16 0h32"/><path d="m192 35 8 17 19 3-14 13 3 19-16-9-17 9 3-19-13-13 18-3Z"/>',
'home':'<path d="m30 112 98-78 98 78M55 103v112h146V103"/><rect x="84" y="126" width="88" height="66" rx="4"/><path d="M84 148h88m-88 22h88m-60-44v66m31-66v66"/>',
'key':'<circle cx="105" cy="109" r="71"/><path d="m105 63 24 47-24 47-24-47ZM161 163l57 57m-35-35 17-17m-4 30 17-17"/>',
'leaf':'<path d="M56 195Q10 58 204 35 230 190 56 195Zm0 0L178 62"/><path d="m126 94-25 53h32l-18 46 60-72h-36l19-27"/>',
'lotus':'<path d="M128 200Q42 129 128 35q86 94 0 165Zm0 0Q30 205 34 93q81 6 94 107Zm0 0q98 5 94-107-81 6-94 107Z"/>',
'recycle':'<path d="m102 57 26-22 37 64m-23-9 23 9 8-25M190 112l30 51-79 44m12-28-12 28 29 2M118 211H45l12-81m15 25-15-25-20 20"/><path d="M110 131a18 18 0 1 1 36 0q0 16-18 31-18-15-18-31Z"/>',
'falcon':'<path d="m128 109-88-60 28 85 60 63 60-63 28-85-88 60Zm-60 25 60-25 60 25M128 109V61l26 13-26 16"/><circle cx="128" cy="210" r="14"/>',
'access':'<circle cx="145" cy="48" r="17"/><path d="m139 75-20 64h58l23 47 22-10m-99-81h64M102 111a54 54 0 1 0 58 74M35 225h185"/>',
'wheat':'<path d="M104 216V51m0 44Q51 90 59 49q45 4 45 46Zm0 52q-53-5-45-46 45 4 45 46Zm0-27q53-5 45-46-45 4-45 46Zm0 55q53-5 45-46-45 4-45 46Z"/><path d="M184 216q-50-30-25-52 15-11 25 7 10-18 25-7 25 22-25 52Z"/>'}
brands=[];jobs=[]
for line in rows.splitlines():
 id,name,title,primary,secondary,pillar,persona,home,shape=line.strip().split('|')
 brand=dict(id=id,name=name,title=title,primary=primary,secondary=secondary,pillar=pillar,persona=persona,homeTitle=home)
 brands.append(brand)
 inner=f'<g fill="none" stroke="{secondary if id=="himayah" else primary}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" transform="translate(38.4 38.4) scale(.7)">{shapes[shape]}</g>'
 logo=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">{inner}</svg>'
 (ROOT/'brand-assets/logos'/f'{id}.svg').write_text(logo)
 folder=ROOT/'mobile/assets/variants'/id;folder.mkdir(parents=True,exist_ok=True)
 (folder/'logo.svg').write_text(logo)
 for kind,w,h in [('icon',1024,1024),('splash',1284,2778),('hero',1080,1920)]:
  size=1024 if kind=='icon' else 640;x=(w-size)/2;y=(h-size)/2-(120 if kind!='icon' else 0)
  background='#F8FAF9' if id!='himayah' else primary
  text='' if kind=='icon' else f'<text x="{w/2}" y="{y+size+50}" text-anchor="middle" font-family="sans-serif" font-size="52" font-weight="bold" fill="{primary if id!="himayah" else secondary}">{escape(name)}</text>'
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><rect width="{w}" height="{h}" fill="{background}"/><circle cx="{w/2}" cy="{h/2}" r="{w*.43}" fill="{secondary}" opacity=".09"/><svg x="{x}" y="{y}" width="{size}" height="{size}" viewBox="0 0 256 256">{inner}</svg>{text}</svg>'
  source=folder/f'{kind}.svg';source.write_text(svg);jobs.append((source,folder/f'{kind}.png'))
(ROOT/'brand-assets/brands.json').write_text(json.dumps(brands,indent=2)+'\n')
def render(job):
 source,target=job
 p=subprocess.run(['inkscape',str(source),'--export-type=png','--export-filename='+str(target)],capture_output=True)
 if p.returncode:raise RuntimeError('SVG rendering failed: '+str(source))
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(render,jobs))
print('Generated 25 SVG identities and 75 square/portrait PNGs.')
