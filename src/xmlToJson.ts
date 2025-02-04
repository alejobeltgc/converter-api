import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

type XmlToJsonResult = Record<string, any>;

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const xmlData = event.isBase64Encoded && event.body
            ? Buffer.from(event.body, 'base64').toString('utf-8')
            : event.body || '';

        // Manejar cuerpo vacío explícitamente
        if (!xmlData.trim()) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Invalid XML format',
                    details: 'Empty XML body',
                }),
            };
        }

        // Validar XML antes de procesarlo
        const validationResult = XMLValidator.validate(xmlData);
        if (validationResult !== true) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Invalid XML format',
                    details: validationResult,
                }),
            };
        }

        // Configuración del parser
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            allowBooleanAttributes: true,
            parseAttributeValue: true,
            cdataPropName: '__cdata',
        });

        const jsonResult: XmlToJsonResult = parser.parse(xmlData);

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonResult),
        };
    } catch (error) {
        console.error('Error parsing XML:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Error converting XML to JSON',
                details: error instanceof Error ? error.message : 'Unknown error',
            }),
        };
    }
};
