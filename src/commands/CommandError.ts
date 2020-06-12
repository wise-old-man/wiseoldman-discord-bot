class CommandError extends Error {
  tip!: string;

  constructor(message: string, tip?: string) {
    super(message);
    this.name = 'CommandError';
    this.message = message;

    if (tip) this.tip = tip;
  }
}

export default CommandError;
