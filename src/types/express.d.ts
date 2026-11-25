// Declaration merging: we add our own field to Express's Request type.
// Every `req` in the app now has `req.id: string`.
declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: { id: number };
    }
  }
}

// Makes this file a module, which `declare global` requires.
export {};
