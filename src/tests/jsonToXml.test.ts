import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler } from '../jsonToXml';
import sinon from 'sinon';
import { XMLBuilder, XMLValidator } from 'fast-xml-parser';

describe('JSON to XML Lambda Handler with Sinon', () => {
    let event: APIGatewayProxyEvent;
    let buildStub: sinon.SinonStub;
    let validateStub: sinon.SinonStub;

    beforeEach(() => {
        event = {
            body: JSON.stringify({ person: { name: 'John', age: 30 } }),
            isBase64Encoded: false,
            headers: {},
            multiValueHeaders: {},
            httpMethod: 'POST',
            path: '/test',
            queryStringParameters: null,
            multiValueQueryStringParameters: null,
            pathParameters: null,
            stageVariables: null,
            resource: '',
            requestContext: {
                accountId: '',
                apiId: '',
                authorizer: null,
                protocol: '',
                httpMethod: 'POST',
                identity: {
                    accessKey: null,
                    accountId: null,
                    caller: null,
                    cognitoAuthenticationProvider: null,
                    cognitoAuthenticationType: null,
                    cognitoIdentityId: null,
                    cognitoIdentityPoolId: null,
                    principalOrgId: null,
                    sourceIp: '',
                    user: null,
                    userAgent: null,
                    userArn: null,
                    clientCert: null,
                    apiKey: null,
                    apiKeyId: null,
                },
                path: '/test',
                stage: '',
                requestId: '',
                requestTimeEpoch: 0,
                resourceId: '',
                resourcePath: '',
            },
        };

        buildStub = sinon.stub(XMLBuilder.prototype, 'build').returns('<person><name>John</name><age>30</age></person>');
        validateStub = sinon.stub(XMLValidator, 'validate').returns(true);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return valid XML when given a valid JSON', async () => {
        const result = (await handler(event, {} as any, () => null)) as APIGatewayProxyResult;

        expect(result.statusCode).toBe(200);
        expect(result.headers?.['Content-Type']).toBe('application/xml');
        expect(result.body).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<person><name>John</name><age>30</age></person>');

        sinon.assert.calledWith(buildStub, { person: { name: 'John', age: 30 } });
        sinon.assert.calledWith(validateStub, '<?xml version="1.0" encoding="UTF-8"?>\n<person><name>John</name><age>30</age></person>');
    });

    it('should return 400 for invalid JSON', async () => {
        event.body = '{ person: { name: John, age: 30 } }';

        const result = (await handler(event, {} as any, () => null)) as APIGatewayProxyResult;

        expect(result.statusCode).toBe(400);
        const body = JSON.parse(result.body);
        expect(body.error).toBe('JSON inválido');
        expect(body.details).toBe('Expected property name or \'}\' in JSON at position 2 (line 1 column 3)');
    });

    it('should return 500 for invalid XML', async () => {
        validateStub.returns('Invalid XML');

        const result = (await handler(event, {} as any, () => null)) as APIGatewayProxyResult;

        expect(result.statusCode).toBe(500);
        const body = JSON.parse(result.body);
        expect(body.error).toBe('El XML generado es inválido');
        expect(body.details).toBe('Invalid XML');
    });

    it('should return 400 when no body is provided', async () => {
        event.body = '';

        const result = (await handler(event, {} as any, () => null)) as APIGatewayProxyResult;

        expect(result.statusCode).toBe(400);
        const body = JSON.parse(result.body);
        expect(body.error).toBe('Cuerpo de solicitud inválido');
    });

    it('should throw an error for invalid JSON structure', async () => {
        event.body = JSON.stringify([{ name: 'John' }]);

        const result = (await handler(event, {} as any, () => null)) as APIGatewayProxyResult;

        expect(result.statusCode).toBe(400);
        const body = JSON.parse(result.body);
        expect(body.error).toBe('JSON inválido');
        expect(body.details).toBe('Estructura JSON inválida');
    });

    it('should handle unexpected errors gracefully', async () => {
        buildStub.throws(new Error('Unexpected build error'));

        const result = (await handler(event, {} as any, () => null)) as APIGatewayProxyResult;

        expect(result.statusCode).toBe(500);
        const body = JSON.parse(result.body);
        expect(body.error).toBe('Error en conversión JSON → XML');
        expect(body.details).toBe('Unexpected build error');
    });
});
