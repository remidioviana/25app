import React from 'react';
import {View,Text} from 'react-native';
import type {RunResult} from '../src/types';
import {reviewSummary} from '../src/reviewSummary';
import {styles as s} from '../src/theme';
function List({title,items}:{title:string;items:string[]}){return items.length?<View style={s.group}><Text style={s.h3}>{title}</Text>{items.map((item,i)=><Text key={i} selectable style={s.text}>{i+1}. {item}</Text>)}</View>:null}
export function AgentReview({result}:{result:RunResult}){
 const review=reviewSummary(result);
 if(!review.visible)return null;
 return <View style={s.group}><Text style={s.h2}>Agent plan & review</Text>{!!review.objective&&<Text selectable style={s.text}>{review.objective}</Text>}
 <List title="Planned steps" items={review.steps}/><List title="Missing information" items={review.missing}/>
 <Text style={s.h3}>{review.verdict}</Text><Text style={s.muted}>Model review is not factual certification. Questions and limitations describe what remains unresolved.</Text>
 <List title="Current limitations or issues" items={review.issues}/><List title="Earlier reviewer feedback" items={review.previousIssues}/><List title="Retrieval warnings" items={review.warnings}/><List title="Proposed next steps" items={review.nextSteps}/>
 {review.roles.map((role,i)=><View key={i} style={s.group}><Text style={s.h3}>{role.role} · pass {i+1}</Text><Text selectable style={s.code}>{role.model}</Text>{role.fallback&&<Text style={s.muted}>{role.reason==='all_keys_http_429'?'Fallback recorded: every key returned HTTP 429.':'Fallback recorded; inspect execution details.'}</Text>}</View>)}
 </View>;
}
