import Express from 'express';

export default async (req: Express.Request, res: Express.Response) => {
  res.json({
    name: 'Joe'
  });
};
