<!-- Template-inspired header with badges and a succinct description. -->

# @domain/schemas

> Domain-specific Zod schemas and generated JSON schemas

This package houses Zod schemas for your domain data (for example equipment or pets) and their generated JSON
Schema counterparts. The core operator package should not import these schemas directly; instead, they are
consumed by the server and UI via a `SchemaResolver`.
