/* eslint-disable  @typescript-eslint/no-explicit-any */
type InputReportListener = (event: HIDInputReportEvent) => any;
type SendReportReceiver = (reportId: number, data: BufferSource) => void;

export class FakeHidDevice implements HIDDevice {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  // `any`: a polymorphic `this` here can't satisfy both `implements` and
  // structural assignability to HIDDevice.
  oninputreport: any = null;
  opened = false;
  readonly vendorId: number;
  readonly productId: number;
  readonly productName = 'product-name';
  readonly collections: HIDCollectionInfo[];

  protected readonly inputReportListeners = new Set<InputReportListener>();
  protected readonly sendReportReceiver?: SendReportReceiver;

  constructor(properties: {
    vendorId: number,
    productId: number,
    collections?: HIDCollectionInfo[],
    sendReportReceiver?: SendReportReceiver,
  }) {
    this.vendorId = properties.vendorId;
    this.productId = properties.productId;
    this.collections = properties.collections || [];
    this.sendReportReceiver = properties.sendReportReceiver;
  }

  async open() {
    if (this.opened) {
      throw new Error('device is already opened');
    }

    this.opened = true;
  }

  async close() {
    if (!this.opened) {
      throw new Error('device is already closed');
    }

    this.opened = false;
  }

  async forget() {
    throw new Error('Not implemented');
  }

  async sendReport(reportId: number, data: BufferSource) {
    if (reportId !== 0) {
      throw new Error(`Unexpected reportId ${reportId}`);
    }

    if (this.sendReportReceiver !== undefined) {
      this.sendReportReceiver(reportId, data);
    }
  }

  async sendFeatureReport(_reportId: number, _data: BufferSource) {
    throw new Error('Not implemented');
  }

  async receiveFeatureReport(_reportId: number): Promise<DataView> {
    throw new Error('Not implemented');
  }

  dispatchEvent(_event: Event): boolean {
    throw new Error('Not implemented');
  }

  // Matches both HIDDevice overloads; only 'inputreport' functions are kept.
  addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject|InputReportListener|null,
      _options?: boolean|AddEventListenerOptions) {
    if (type === 'inputreport' && typeof listener === 'function') {
      this.inputReportListeners.add(listener as InputReportListener);
    }
  }

  removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject|InputReportListener|null,
      _options?: boolean|EventListenerOptions) {
    if (type === 'inputreport' && typeof listener === 'function') {
      this.inputReportListeners.delete(listener as InputReportListener);
    }
  }

  async handleInputReport(data: number[], timeStamp = 0) {
    const dataView = new DataView(new Uint8Array(data).buffer);
    const event: HIDInputReportEvent =
        {data: dataView, timeStamp} as unknown as HIDInputReportEvent;
    await Promise.all(
        [...this.inputReportListeners].map(listener => listener(event)));
  }
}
