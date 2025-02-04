import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler } from '../xmlToJson';
import sinon from 'sinon';
import { XMLParser, XMLValidator } from 'fast-xml-parser';

describe('XML to JSON Lambda Handler with Sinon', () => {
    let event: APIGatewayProxyEvent;
    let validateStub: sinon.SinonStub;
    let parseStub: sinon.SinonStub;

    beforeEach(() => {
        event = {
            body: '<person><name>John</name><age>30</age></person>',
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

        // Creamos un stub para XMLValidator.validate
        validateStub = sinon.stub(XMLValidator, 'validate').returns(true);

        // Creamos un stub para XMLParser.parse
        parseStub = sinon.stub(XMLParser.prototype, 'parse').returns({ person: { name: 'John', age: '30' } });
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return a valid JSON when given a valid XML', async () => {
        const result = (await handler(event, {} as any, () => {})) as APIGatewayProxyResult;

        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body);
        expect(body.person.name).toBe('John');
        expect(body.person.age).toBe('30');

        sinon.assert.calledWith(validateStub, event.body);
        sinon.assert.calledWith(parseStub, event.body);
    });

    it('should handle base64-encoded XML body', async () => {
        const xmlContent = '<person><name>Jane</name><age>25</age></person>';
        const base64EncodedBody = Buffer.from(xmlContent, 'utf-8').toString('base64');
        event.isBase64Encoded = true;
        event.body = base64EncodedBody;

        // Configura los stubs para este caso específico
        validateStub.returns(true); // La validación del XML siempre pasa
        parseStub.withArgs(xmlContent).returns({ person: { name: 'Jane', age: 25 } });

        const result = (await handler(event, {} as any, () => {})) as APIGatewayProxyResult;

        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body);
        expect(body.person.name).toBe('Jane'); // Ahora debe pasar correctamente
        expect(body.person.age).toBe(25);

        sinon.assert.calledWith(validateStub, xmlContent); // Valida el cuerpo decodificado
        sinon.assert.calledWith(parseStub, xmlContent); // Valida que el parser fue llamado con el contenido decodificado
    });

    it('should handle base64-encoded XML body', async () => {
        const xmlContent = '<person><name>Jane</name><age>25</age></person>';
        event.isBase64Encoded = true;
        event.body = Buffer.from(xmlContent, 'utf-8').toString('base64');

        // Configuramos el comportamiento específico para este test en el parser
        validateStub.returns(true); // La validación siempre pasa
        parseStub.withArgs(xmlContent).returns({ person: { name: 'Jane', age: 25 } });

        const result = (await handler(event, {} as any, () => {})) as APIGatewayProxyResult;

        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body);
        expect(body.person.name).toBe('Jane');
        expect(body.person.age).toBe(25);

        sinon.assert.calledWith(validateStub, xmlContent);
        sinon.assert.calledWith(parseStub, xmlContent);
    });

    it('should handle an empty plain-text body', async () => {
        event.isBase64Encoded = false;
        event.body = '';

        const result = (await handler(event, {} as any, () => {})) as APIGatewayProxyResult;

        expect(result.statusCode).toBe(400);
        const body = JSON.parse(result.body);
        expect(body.error).toBe('Invalid XML format');
        expect(body.details).toBe('Empty XML body');

        // No deberíamos llamar a validateStub ni a parseStub
        sinon.assert.notCalled(validateStub);
        sinon.assert.notCalled(parseStub);
    });


    it('should return 400 for invalid XML format', async () => {
        validateStub.returns('Invalid XML structure');

        const result = (await handler(event, {} as any, () => {})) as APIGatewayProxyResult;

        expect(result.statusCode).toBe(400);
        const body = JSON.parse(result.body);
        expect(body.error).toBe('Invalid XML format');
        expect(body.details).toBe('Invalid XML structure');

        sinon.assert.calledOnce(validateStub);
        sinon.assert.notCalled(parseStub);
    });

    it('should handle internal errors gracefully', async () => {
        parseStub.throws(new Error('Parsing failed'));

        const result = (await handler(event, {} as any, () => {})) as APIGatewayProxyResult;

        expect(result.statusCode).toBe(500);
        const body = JSON.parse(result.body);
        expect(body.error).toBe('Error converting XML to JSON');
        expect(body.details).toBe('Parsing failed');
    });
});