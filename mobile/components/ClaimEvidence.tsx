import React, {useState} from 'react';
import {View, Text, Pressable} from 'react-native';
import type {RunResult} from '../src/types';
import {claimEvidence} from '../src/claimEvidence';
import {styles as s} from '../src/theme';

function Claim({claim}: {claim: ReturnType<typeof claimEvidence>[number]}) {
  const [expanded, setExpanded] = useState(false);
  return <View style={s.group}>
    <Text style={s.tag}>{claim.basis}</Text><Text selectable style={s.text}>{claim.text}</Text>
    {claim.missingCitation && <Text style={s.error}>No citation recorded for this evidence claim.</Text>}
    {claim.references.length > 0 && <>
      <Pressable accessibilityRole="button" accessibilityState={{expanded}}
        style={{minHeight: 48, justifyContent: 'center'}} onPress={() => setExpanded(!expanded)}>
        <Text style={s.label}>{expanded ? 'Hide' : 'Inspect'} sources ({claim.references.length})</Text>
      </Pressable>
      {expanded && claim.references.map(({id, source}) => <View key={id} style={s.group}>
        <Text selectable style={s.code}>{id}</Text>
        {source ? <><Text style={s.h3}>{source.title}</Text><Text selectable style={s.text}>{source.text}</Text>
          <Text style={s.muted}>{source.source} · {source.as_of || 'Date not supplied'}</Text></>
          : <Text style={s.error}>This reference is absent from the saved run evidence.</Text>}
      </View>)}
    </>}
  </View>;
}
export function ClaimEvidence({result}: {result: RunResult}) {
  const claims = claimEvidence(result);
  if (!claims.length) return null;
  return <View style={s.group}><Text style={s.h2}>Claims & sources</Text>
    <Text style={s.muted}>Citation links show the recorded sources; they do not prove that a claim is supported or current.</Text>
    {claims.map((claim, i) => <Claim key={JSON.stringify([i, claim])} claim={claim}/>)}</View>;
}
