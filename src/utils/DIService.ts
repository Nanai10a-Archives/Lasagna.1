export class ServiceProvider {
  private readonly transients: ReadonlyMap<string, () => unknown>;

  protected constructor(transients: ReadonlyMap<string, () => unknown>) {
    this.transients = transients;
  }

  getService = (interfaceName: string): unknown => {
    const constructor = this.transients.get(interfaceName);

    if (constructor == undefined)
      throw new Error(`could not get constructor from name of '${interfaceName}'`);

    return constructor();
  };
}

export class ServiceCollection extends ServiceProvider {
  private readonly _transients: Map<string, () => unknown> = new Map();

  addTransient = (interfaceName: string, constructor: () => unknown): void => {
    if (this._transients.get(interfaceName) != undefined)
      throw new Error(`already added name of '${interfaceName}'`);

    this._transients.set(interfaceName, constructor);
  };

  buildServiceProvider = (): ServiceProvider => {
    return new ServiceProvider(this._transients);
  };
}
