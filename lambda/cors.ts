export function cors() {
    const setCorsHeaders = async (request: { response: { headers: any; }; }) => {
        return {
            ...request.response,
            headers: {
                ...request.response.headers,
                'Access-Control-Allow-Origin': process.env.allowOrigins,
                'Access-Control-Allow-Headers': process.env.allowHeaders,
                'Access-Control-Allow-Methods': process.env.allowMethods,
            }
        };
    };
    return {
      after: setCorsHeaders,
      onError: setCorsHeaders,
    };
}