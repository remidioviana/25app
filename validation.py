import math

def validate(value, schema, path='$'):
    types=schema.get('type'); types=types if isinstance(types,list) else [types]
    valid={'object':isinstance(value,dict),'array':isinstance(value,list),'string':isinstance(value,str),
           'number':type(value) is int or (type(value) is float and math.isfinite(value)),'integer':type(value) is int,
           'boolean':type(value) is bool,'null':value is None}
    if not any(valid.get(t,False) for t in types): raise ValueError(f'{path}: expected type {types}')
    if 'enum' in schema and value not in schema['enum']:raise ValueError(path+': value is outside the permitted choices')
    if isinstance(value,dict):
        for k in schema.get('required',[]):
            if k not in value: raise ValueError(f'{path}.{k}: required')
        for k,v in value.items():
            if k in schema.get('properties',{}): validate(v,schema['properties'][k],path+'.'+k)
            elif isinstance(schema.get('additionalProperties'),dict): validate(v,schema['additionalProperties'],path+'.'+k)
            elif schema.get('additionalProperties') is False: raise ValueError(f'{path}.{k}: field not allowed')
    if isinstance(value,list):
        if len(value)>schema.get('maxItems',500): raise ValueError(path+': too many items')
        for i,v in enumerate(value): validate(v,schema['items'],f'{path}[{i}]')
    if isinstance(value,str) and len(value)>schema.get('maxLength',100000): raise ValueError(path+': text too long')
    if type(value) in (int,float):
        if 'minimum' in schema and value<schema['minimum']: raise ValueError(path+': below minimum')
        if 'maximum' in schema and value>schema['maximum']: raise ValueError(path+': above maximum')


def unique_json_object(pairs):
    """Reject ambiguous JSON objects without echoing keys or private values."""
    result={}
    for key,value in pairs:
        if key in result:raise ValueError('JSON object contains duplicate keys')
        result[key]=value
    return result


def validate_json_unicode(value):
    """Ensure decoded JSON text can be stored and hashed as UTF-8."""
    pending=[value]
    while pending:
        item=pending.pop()
        if isinstance(item,str):
            try:item.encode('utf-8')
            except UnicodeEncodeError:raise ValueError('JSON text must contain valid Unicode') from None
        elif isinstance(item,dict):
            pending.extend(item.keys());pending.extend(item.values())
        elif isinstance(item,list):pending.extend(item)
