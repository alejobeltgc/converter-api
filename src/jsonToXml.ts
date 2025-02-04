import { APIGatewayProxyHandler } from 'aws-lambda';
import { XMLBuilder, XMLValidator } from 'fast-xml-parser';

interface JsonData {
    [key: string]: unknown | JsonData | JsonData[];
    '@_attributes'?: { [key: string]: string };
    '#text'?: string;
}

const builderOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    textNodeName: "#text",
    format: true,
    suppressEmptyNode: true,
    cdataPropName: "__cdata",
    unpairedTags: ["br", "hr", "img"],
};

const xmlBuilder = new XMLBuilder(builderOptions);

const isJsonData = (data: unknown): data is JsonData =>
    typeof data === 'object' && data !== null && !Array.isArray(data);

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Cuerpo de solicitud inválido' }),
            };
        }

        let parsedBody: JsonData;
        try {
            parsedBody = JSON.parse(event.body);
        } catch (error) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'JSON inválido', details: error instanceof Error ? error.message : '' }),
            };
        }

        if (!isJsonData(parsedBody)) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'JSON inválido' }),
            };
        }

        const xml = xmlBuilder.build(parsedBody);
        const fullXml = `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;

        const validationResult = XMLValidator.validate(fullXml);
        if (validationResult !== true) {
            return {
                statusCode: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'El XML generado es inválido',
                    details: validationResult,
                }),
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/xml' },
            body: fullXml,
        };

    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Error en conversión JSON → XML',
                details: error instanceof Error ? error.message : 'Error desconocido',
            }),
        };
    }
};
