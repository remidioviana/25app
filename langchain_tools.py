"""Actual LangChain StructuredTool bindings with immutable per-run data and scope."""
import copy
from pydantic import BaseModel, ConfigDict, Field
from langchain_core.tools import StructuredTool
import storage as db
import retrieval
import source_tools
from domain_tools import TOOLS

class StrictStructuredTool(StructuredTool):
    def _to_args_and_kwargs(self,tool_input,tool_call_id):
        if not isinstance(tool_input,dict):raise ValueError('Tools require a JSON object')
        self.args_schema.model_validate(tool_input)
        return super()._to_args_and_kwargs(tool_input,tool_call_id)

class NoArguments(BaseModel):
    model_config=ConfigDict(extra='forbid')

class SearchArguments(BaseModel):
    model_config=ConfigDict(extra='forbid')
    query:str=Field(min_length=1,max_length=2000)

class SourceArguments(BaseModel):
    model_config=ConfigDict(extra='forbid')
    source_id:str=Field(min_length=1,max_length=64)


def build_tools(spec,data,semantic=False):
    agent=spec['id'];immutable=copy.deepcopy(data)
    def analyze():return TOOLS[agent](copy.deepcopy(immutable))
    def search(query):return retrieval.search(agent,query,semantic=semantic)
    def memory():return db.memory(agent)
    def sources():return source_tools.available(agent)
    def refresh(source_id):return source_tools.refresh(source_id,agent)
    return {
      'analyze':StrictStructuredTool.from_function(analyze,name=spec['tool'],description=spec['title']+'; uses the mission original inputs.',args_schema=NoArguments),
      'search':StrictStructuredTool.from_function(search,name='search_knowledge',description='Searches only documents belonging to this app.',args_schema=SearchArguments),
      'memory':StrictStructuredTool.from_function(memory,name='read_memory',description='Reads accepted results from this app, excluding demos.',args_schema=NoArguments),
      'sources':StrictStructuredTool.from_function(sources,name='list_sources',description='Lists fixed permitted public sources; does not claim they were retrieved.',args_schema=NoArguments),
      'refresh':StrictStructuredTool.from_function(refresh,name='refresh_source',description='Read one fixed permitted public source into this app evidence store. No user URLs or external writes.',args_schema=SourceArguments)}
