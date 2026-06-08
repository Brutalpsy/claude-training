from mcp.server.fastmcp import FastMCP
from pydantic import Field

mcp = FastMCP("DocumentMCP", log_level="ERROR")


docs = {
    "deposition.md": "This deposition covers the testimony of Angela Smith, P.E.",
    "report.pdf": "The report details the state of a 20m condenser tower.",
    "financials.docx": "These financials outline the project's budget and expenditures.",
    "outlook.pdf": "This document presents the projected future performance of the system.",
    "plan.md": "The plan outlines the steps for the project's implementation.",
    "spec.txt": "These specifications define the technical requirements for the equipment.",
}


@mcp.tool(name = "read_doc_contents", description = "Read the contents of a document and return the contents as a string")

def read_document(doc_id: str = Field(description = "The id of the document to read")):
    if doc_id not in docs:
        raise ValueError(f"Document with id {doc_id} not found")
    
    return docs[doc_id]


@mcp.tool(
    name = "edit_document",
    description = "Edit a document by replacing a string in documets content with a new string"
)


def edit_document(
    doc_id: str = Field(description = "The id of the document to edit"), 
    old_string: str = Field(description = "The string to replace"),
    new_string: str = Field(description = "The new string to replace the old string with")
):
    if doc_id not in docs:
        raise ValueError(f"Document with id {doc_id} not found")
    
    docs[doc_id] = docs[doc_id].replace(old_string, new_string)
    



@mcp.resource(
    "docs://documents",
    mime_type="application/json"
)

def list_docs()-> list[str]:
    return list(docs.keys())


@mcp.resource(
    "docs://documents/{doc_id}",
    mime_type="text/plain"
)

def get_doc(doc_id: str)-> str:
    print(f"Getting document {doc_id}")
    if doc_id not in docs:
        raise ValueError(f"Document with id {doc_id} not found")
    return docs[doc_id]



# TODO: Write a prompt to rewrite a doc in markdown format
# TODO: Write a prompt to summarize a doc


if __name__ == "__main__":
    mcp.run(transport="stdio")
