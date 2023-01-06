import { NextApiRequest, NextApiResponse } from "next";

export type SUPPORTED_METHOD = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type APIMethodHandlers = {
    [key in SUPPORTED_METHOD]: (req: NextApiRequest, res: NextApiResponse) => void | NextApiResponse<any> | Promise<void> | Promise<NextApiResponse<any>> | Promise<void | NextApiResponse<any>>;
};

export const getMethodHandlers = (config: Partial<APIMethodHandlers>) => {
    const initial: APIMethodHandlers = {
        GET: (req: NextApiRequest, res: NextApiResponse) => {
            return res.status(405).json({ message: 'Unsupported method' });
        },
        DELETE: (req: NextApiRequest, res: NextApiResponse) => {
            return res.status(405).json({ message: 'Unsupported method' });
        },
        PATCH: (req: NextApiRequest, res: NextApiResponse) => {
            return res.status(405).json({ message: 'Unsupported method' });
        },
        POST: (req: NextApiRequest, res: NextApiResponse) => {
            return res.status(405).json({ message: 'Unsupported method' });
        },
        PUT: (req: NextApiRequest, res: NextApiResponse) => {
            return res.status(405).json({ message: 'Unsupported method' });
        },
    }

    return {
        ...initial,
        ...config,
    }
}

export const exposeHandler = (req: NextApiRequest, res: NextApiResponse, config: APIMethodHandlers) => {
    if (req.method) {
        if (Object.keys(config).includes(req.method)) {
            return config[req.method as SUPPORTED_METHOD](req, res);
        } else {
            return res.status(405).json({ message: 'Unsupported method' });
        }
    } else {
        return res.status(405).json({ message: 'Unsupported method' });
    }
}