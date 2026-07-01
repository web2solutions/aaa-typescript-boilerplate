/* eslint-disable jest/no-untyped-mock-factory */
import cluster from 'cluster';
import { Server } from 'socket.io';

const setupPrimaryMock = jest.fn();
const createAdapterMock = jest.fn();

jest.mock('@socket.io/cluster-adapter', () => ({
  setupPrimary: (...args: any[]) => setupPrimaryMock(...args),
  createAdapter: (...args: any[]) => createAdapterMock(...args)
}));

describe('clusterAdapter lifecycle', () => {
  beforeEach(() => {
    setupPrimaryMock.mockReset();
    createAdapterMock.mockReset();
  });

  it('sets up cluster primary process serialization and adapter bridge', async () => {
    expect.hasAssertions();
    const setupPrimarySpy = jest.spyOn(cluster, 'setupPrimary').mockImplementation(() => undefined as any);
    const fakeIo = { adapter: jest.fn() } as unknown as Server;
    const fakeAdapter = jest.fn();
    createAdapterMock.mockReturnValue(fakeAdapter);
    const {
      setupSocketIoClusterPrimary,
      createClusterSocketIoAdapter
    } = await import('@src/interface/WebSocket/adapters/socket-io/clusterAdapter');

    setupSocketIoClusterPrimary();
    const adapter = createClusterSocketIoAdapter();
    await adapter.configure(fakeIo);
    await adapter.cleanup();

    expect(setupPrimaryMock).toHaveBeenCalledTimes(1);
    expect(setupPrimarySpy).toHaveBeenCalledWith({ serialization: 'advanced' });
    expect(createAdapterMock).toHaveBeenCalledTimes(1);
    expect((fakeIo.adapter as any)).toHaveBeenCalledWith(fakeAdapter);
    setupPrimarySpy.mockRestore();
  });
});
