import { JsonSchemaType } from '@operator/core'

import type { IChangeEvent } from '@rjsf/core'
import Form from '@rjsf/core'
import type { RJSFSchema, UiSchema } from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import { type ReactElement, useCallback } from 'react'

export type FormPaneProps = {
    formData: Record<string, JsonSchemaType>
    schema: RJSFSchema
    uiSchema?: UiSchema
    onChange?: (formData: Record<string, JsonSchemaType>) => void
}

/**
 * JSON Schema form panel powered by RJSF.
 * Renders a form from a JSON Schema and manages form data changes.
 */
export function FormPane({ formData, onChange, schema, uiSchema }: FormPaneProps): ReactElement {
    const handleChange = useCallback(
        (event: IChangeEvent) => {
            if (onChange && event.formData !== undefined) {
                onChange(event.formData as Record<string, JsonSchemaType>)
            }
        },
        [onChange],
    )

    return (
        <div className="form-pane">
            <div className="form-pane__header">
                <h3>{(schema.title as string) ?? 'Form'}</h3>
            </div>
            <div className="form-pane__body">
                <Form
                    formData={formData}
                    onChange={handleChange}
                    schema={schema}
                    validator={validator}
                    {...(uiSchema ? { uiSchema } : {})}
                >
                    {/* Hide default submit button */}
                    <></>
                </Form>
            </div>
            <div className="form-pane__footer">
                <details>
                    <summary>
                        <strong>Form Data (JSON)</strong>
                    </summary>
                    <pre
                        style={{
                            background: '#f5f5f5',
                            maxHeight: '300px',
                            overflow: 'auto',
                            padding: '1rem',
                        }}
                    >
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    )
}
