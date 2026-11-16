import {test} from 'node:test';
import assert from 'node:assert/strict';
import {providerStatus} from '../src/providerStatus';
import type {Config,ProviderConfiguration} from '../src/types';

const base:Config={requires_token:false,model_configured:true,langgraph_available:true,embedding_configured:false,version:'test'};
const configured:ProviderConfiguration={status:'configured_unverified',configured:true,configuration_valid:true,roles:{planner:'one',specialist:'one',critic:'two'},distinct_models:2,inference_verified:false};

test('key presence cannot override rejected or missing provider configuration',()=>{
 assert.equal(providerStatus(null).canAttempt,false);
 assert.equal(providerStatus({...base,provider:{...configured,status:'invalid_configuration',configuration_valid:false}}).canAttempt,false);
 assert.equal(providerStatus({...base,provider:{...configured,status:'missing_credentials',configured:false}}).canAttempt,false);
 assert.equal(providerStatus({...base,model_configured:false,provider:configured}).canAttempt,false);
 assert.equal(providerStatus({...base,model_configured:false}).canAttempt,false);
});

test('configured roles may share identifiers without becoming verified inference or three models',()=>{
 const status=providerStatus({...base,provider:configured});
 assert.equal(status.canAttempt,true);assert.match(status.label,/unverified/);
 assert.match(status.detail,/Three roles; 2 configured model identifiers/);assert.match(status.detail,/does not verify inference/);
 const legacy=providerStatus(base);assert.equal(legacy.canAttempt,true);assert.match(legacy.detail,/without detailed validation/);
});
