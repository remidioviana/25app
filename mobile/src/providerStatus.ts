import type {Config} from './types';

/** Configuration permits an attempt; only a real run receipt establishes execution. */
export function providerStatus(config:Config|null){
 if(!config)return {canAttempt:false,label:'Provider status unknown',detail:'Connect a workspace to inspect its server configuration. No model call has been verified here.'};
 const provider=config.provider;
 if(!provider)return config.model_configured?
  {canAttempt:true,label:'Provider configured · unverified',detail:'This server reports configuration without detailed validation metadata. A successful model call is not established.'}:
  {canAttempt:false,label:'Provider not configured',detail:'Local server tools remain available. No configured model access is reported.'};
 if(provider.status==='invalid_configuration'||!provider.configuration_valid)return {canAttempt:false,label:'Provider configuration needs correction',detail:'The server rejected its model configuration. Correct it server-side before attempting AI; local tools remain available.'};
 if(provider.status==='missing_credentials'||!provider.configured||!config.model_configured)return {canAttempt:false,label:'Provider not configured',detail:'No usable server-side provider configuration is reported. Do not enter provider API keys in this app or in chat.'};
 if(provider.status!=='configured_unverified')return {canAttempt:false,label:'Provider status unknown',detail:'The server returned an unsupported configuration state; no successful call can be inferred.'};
 const count=Number.isInteger(provider.distinct_models)&&provider.distinct_models>=0&&provider.distinct_models<=3?String(provider.distinct_models):'an unconfirmed number of';
 return {canAttempt:true,label:'Provider configured · unverified',detail:`Three roles; ${count} configured model identifiers. This configuration status does not verify inference, independent model execution or factual accuracy.${provider.preview_roles?.length?' Preview model configuration is enabled.':''}`};
}
