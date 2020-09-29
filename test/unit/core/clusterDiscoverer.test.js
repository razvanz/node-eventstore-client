const fs = require('fs');
const path = require('path');
const dns = require('dns');

const ClusterDiscoverer = require('../../../src/core/cluster/clusterDiscoverer');
const ClusterInfo = require('../../../src/core/cluster/clusterInfo');
const GossipSeed = require('../../../src/gossipSeed');
const NodeEndPoints = require('../../../src/core/cluster/nodeEndpoints');

const logger = { info: () => {} };

describe('ClusterDiscoverer', () => {
  const mockDns = {
    ADDRCONFIG: dns.ADDRCONFIG,
    V4MAPPED: dns.V4MAPPED,
  };
  const mockHttp = {};
  const settings = {
    clusterDns: 'my-discover.com:2113',
    maxDiscoverAttempts: 10,
    discoverDelay: 10,
    managerExternalHttpPort: 2113,
    seeds: null,
    gossipTimeout: 1000,
  };
  const tClusterInfo = new ClusterInfo([
    {
      instanceId: 'bb16857d-373d-4233-a175-89c917a72329',
      timeStamp: '2020-09-02T13:53:24.234898Z',
      state: 'Slave',
      isAlive: false,
      internalTcpIp: '10.0.0.1',
      internalTcpPort: 1112,
      internalSecureTcpPort: 0,
      externalTcpIp: '10.0.0.1',
      externalTcpPort: 1113,
      externalSecureTcpPort: 0,
      internalHttpIp: '10.0.0.1',
      internalHttpPort: 2112,
      externalHttpIp: '10.0.0.1',
      externalHttpPort: 2113,
      lastCommitPosition: 648923382,
      writerCheckpoint: 648936339,
      chaserCheckpoint: 648936339,
      epochPosition: 551088596,
      epochNumber: 201,
      epochId: 'd8f95f4b-167a-4487-9031-4d31a507e6d9',
      nodePriority: 0,
    },
    {
      instanceId: 'b3c18dcd-6476-467a-b7b8-d6672b74e9c2',
      timeStamp: '2020-09-02T13:56:06.189428Z',
      state: 'CatchingUp',
      isAlive: true,
      internalTcpIp: '10.0.0.2',
      internalTcpPort: 1112,
      internalSecureTcpPort: 0,
      externalTcpIp: '10.0.0.2',
      externalTcpPort: 1113,
      externalSecureTcpPort: 0,
      internalHttpIp: '10.0.0.2',
      internalHttpPort: 2112,
      externalHttpIp: '10.0.0.2',
      externalHttpPort: 2113,
      lastCommitPosition: -1,
      writerCheckpoint: 0,
      chaserCheckpoint: 0,
      epochPosition: -1,
      epochNumber: -1,
      epochId: '00000000-0000-0000-0000-000000000000',
      nodePriority: 0,
    },
    {
      instanceId: 'e802a2b5-826c-4bd5-84d0-c9d1387fbf79',
      timeStamp: '2020-09-02T13:56:07.391534Z',
      state: 'Master',
      isAlive: true,
      internalTcpIp: '10.0.0.3',
      internalTcpPort: 1112,
      internalSecureTcpPort: 0,
      externalTcpIp: '10.0.0.3',
      externalTcpPort: 1113,
      externalSecureTcpPort: 0,
      internalHttpIp: '10.0.0.3',
      internalHttpPort: 2112,
      externalHttpIp: '10.0.0.3',
      externalHttpPort: 2113,
      lastCommitPosition: 649007631,
      writerCheckpoint: 649024685,
      chaserCheckpoint: 649024685,
      epochPosition: 649023795,
      epochNumber: 202,
      epochId: '1f17695d-6558-4d8b-ba60-2ae273b11e09',
      nodePriority: 0,
    },
    {
      instanceId: '24bb9031-5f21-436c-a7b5-c5f03a95e938',
      timeStamp: '2020-09-02T13:54:39.023053Z',
      state: 'Slave',
      isAlive: false,
      internalTcpIp: '10.0.0.4',
      internalTcpPort: 1112,
      internalSecureTcpPort: 0,
      externalTcpIp: '10.0.0.4',
      externalTcpPort: 1113,
      externalSecureTcpPort: 0,
      internalHttpIp: '10.0.0.4',
      internalHttpPort: 2112,
      externalHttpIp: '10.0.0.4',
      externalHttpPort: 2113,
      lastCommitPosition: 649007631,
      writerCheckpoint: 649023795,
      chaserCheckpoint: 649023795,
      epochPosition: 551088596,
      epochNumber: 201,
      epochId: 'd8f95f4b-167a-4487-9031-4d31a507e6d9',
      nodePriority: 0,
    },
  ]);
  const tClusterInfoNoBestNode = new ClusterInfo([
    {
      instanceId: 'bb16857d-373d-4233-a175-89c917a72329',
      timeStamp: '2020-09-02T13:53:24.234898Z',
      state: 'Manager',
      isAlive: true,
      internalTcpIp: '10.0.0.1',
      internalTcpPort: 1112,
      internalSecureTcpPort: 0,
      externalTcpIp: '10.0.0.1',
      externalTcpPort: 1113,
      externalSecureTcpPort: 0,
      internalHttpIp: '10.0.0.1',
      internalHttpPort: 2112,
      externalHttpIp: '10.0.0.1',
      externalHttpPort: 2113,
      lastCommitPosition: 648923382,
      writerCheckpoint: 648936339,
      chaserCheckpoint: 648936339,
      epochPosition: 551088596,
      epochNumber: 201,
      epochId: 'd8f95f4b-167a-4487-9031-4d31a507e6d9',
      nodePriority: 0,
    },
    {
      instanceId: 'b3c18dcd-6476-467a-b7b8-d6672b74e9c2',
      timeStamp: '2020-09-02T13:56:06.189428Z',
      state: 'CatchingUp',
      isAlive: false,
      internalTcpIp: '10.0.0.2',
      internalTcpPort: 1112,
      internalSecureTcpPort: 0,
      externalTcpIp: '10.0.0.2',
      externalTcpPort: 1113,
      externalSecureTcpPort: 0,
      internalHttpIp: '10.0.0.2',
      internalHttpPort: 2112,
      externalHttpIp: '10.0.0.2',
      externalHttpPort: 2113,
      lastCommitPosition: -1,
      writerCheckpoint: 0,
      chaserCheckpoint: 0,
      epochPosition: -1,
      epochNumber: -1,
      epochId: '00000000-0000-0000-0000-000000000000',
      nodePriority: 0,
    },
    {
      instanceId: 'e802a2b5-826c-4bd5-84d0-c9d1387fbf79',
      timeStamp: '2020-09-02T13:56:07.391534Z',
      state: 'Master',
      isAlive: false,
      internalTcpIp: '10.0.0.3',
      internalTcpPort: 1112,
      internalSecureTcpPort: 0,
      externalTcpIp: '10.0.0.3',
      externalTcpPort: 1113,
      externalSecureTcpPort: 0,
      internalHttpIp: '10.0.0.3',
      internalHttpPort: 2112,
      externalHttpIp: '10.0.0.3',
      externalHttpPort: 2113,
      lastCommitPosition: 649007631,
      writerCheckpoint: 649024685,
      chaserCheckpoint: 649024685,
      epochPosition: 649023795,
      epochNumber: 202,
      epochId: '1f17695d-6558-4d8b-ba60-2ae273b11e09',
      nodePriority: 0,
    },
    {
      instanceId: '24bb9031-5f21-436c-a7b5-c5f03a95e938',
      timeStamp: '2020-09-02T13:54:39.023053Z',
      state: 'Slave',
      isAlive: false,
      internalTcpIp: '10.0.0.4',
      internalTcpPort: 1112,
      internalSecureTcpPort: 0,
      externalTcpIp: '10.0.0.4',
      externalTcpPort: 1113,
      externalSecureTcpPort: 0,
      internalHttpIp: '10.0.0.4',
      internalHttpPort: 2112,
      externalHttpIp: '10.0.0.4',
      externalHttpPort: 2113,
      lastCommitPosition: 649007631,
      writerCheckpoint: 649023795,
      chaserCheckpoint: 649023795,
      epochPosition: 551088596,
      epochNumber: 201,
      epochId: 'd8f95f4b-167a-4487-9031-4d31a507e6d9',
      nodePriority: 0,
    },
  ]);
  const discoverer = new ClusterDiscoverer(logger, settings, mockDns, mockHttp);
  const discovererWithGossipSeeds = new ClusterDiscoverer(
    logger,
    {
      ...settings,
      ...{
        seeds: [
          new GossipSeed({
            host: '10.0.0.1',
            port: 2113,
          }),
          new GossipSeed({
            host: '10.0.0.1',
            port: 2113,
          }),
          new GossipSeed({
            host: '10.0.0.1',
            port: 2113,
          }),
        ],
      },
    },
    mockDns,
    mockHttp
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('Should be defined', () => {
      expect(discoverer).toBeDefined();
    });

    test('Should throw an error', () => {
      expect(
        () =>
          new ClusterDiscoverer(
            logger,
            {
              clusterDns: null,
              maxDiscoverAttempts: 10,
              managerExternalHttpPort: 2113,
              seeds: null,
              gossipTimeout: 1000,
            },
            mockDns,
            mockHttp
          )
      ).toThrow();
    });
    expect(
      () =>
        new ClusterDiscoverer(
          logger,
          {
            clusterDns: null,
            maxDiscoverAttempts: 10,
            managerExternalHttpPort: 2113,
            seeds: [],
            gossipTimeout: 1000,
          },
          mockDns,
          mockHttp
        )
    ).toThrow();
  });

  describe('#_resolveDns', () => {
    test('Should call lookup', async () => {
      mockDns.lookup = jest.fn().mockResolvedValue([
        {
          address: '10.0.0.1',
          family: 4,
        },
      ]);
      await discoverer._resolveDns('my-discover.com:2113');
      expect(mockDns.lookup).toHaveBeenCalledWith('my-discover.com:2113', {
        family: 4,
        hints: dns.ADDRCONFIG | dns.V4MAPPED,
        all: true,
      });
    });

    test('Should reject if dnsService fails', async () => {
      mockDns.lookup = jest.fn().mockRejectedValue(new Error('Unexpected DNS error'));
      await expect(discoverer._resolveDns('my-discover.com:2113')).rejects.toBeDefined();
    });

    test('Should reject if no addresses are returned', async () => {
      mockDns.lookup = jest.fn().mockResolvedValue([]);
      await expect(discoverer._resolveDns('my-discover.com:2113')).rejects.toEqual(
        new Error('No result from dns lookup for my-discover.com:2113')
      );
    });

    test('Should return a list of candidate addresses', async () => {
      mockDns.lookup = jest.fn().mockResolvedValue([
        {
          address: '10.0.0.1',
          family: 4,
        },
        {
          address: '10.0.0.2',
          family: 4,
        },
        {
          address: '10.0.0.3',
          family: 4,
        },
      ]);
      const candidates = await discoverer._resolveDns('my-discover.com:2113');
      expect(candidates).toEqual(['10.0.0.1', '10.0.0.2', '10.0.0.3']);
    });
  });

  describe('#_clusterInfo', () => {
    test('Should call httpService.request to get cluster informations', async () => {
      const tCandidate = new GossipSeed(
        {
          host: '10.0.0.1',
          port: '2113',
        },
        undefined
      );
      const tTimeout = 1000;
      const requestEvents = {};
      let responseCallback;
      mockHttp.request = jest.fn((options, callback) => {
        responseCallback = callback;
        return {
          setTimeout: jest.fn(() => ({})),
          on: (type, callback) => {
            requestEvents[type] = callback;
          },
          end: () => {},
          destroy: () => {},
        };
      });
      discoverer._clusterInfo(tCandidate, tTimeout);
      expect(mockHttp.request).toHaveBeenCalledWith(
        {
          host: tCandidate.endPoint.host,
          port: tCandidate.endPoint.port,
          path: '/gossip?format=json',
          timeout: tTimeout,
        },
        expect.anything()
      );
    });

    test('Should call httpService.request to get cluster informations with host header', async () => {
      const tCandidate = new GossipSeed(
        {
          host: '10.0.0.1',
          port: '2113',
        },
        undefined,
        'MyHost'
      );
      const tTimeout = 1000;
      const requestEvents = {};
      let responseCallback;
      mockHttp.request = jest.fn((options, callback) => {
        responseCallback = callback;
        return {
          setTimeout: jest.fn(() => ({})),
          on: (type, callback) => {
            requestEvents[type] = callback;
          },
          end: () => {},
          destroy: () => {},
        };
      });
      discoverer._clusterInfo(tCandidate, tTimeout);
      expect(mockHttp.request).toHaveBeenCalledWith(
        {
          host: tCandidate.endPoint.host,
          port: tCandidate.endPoint.port,
          path: '/gossip?format=json',
          timeout: tTimeout,
          headers: {
            Host: tCandidate.hostHeader,
          },
        },
        expect.anything()
      );
    });

    test('Should return a timeout error if the sockets fails to be connected in the specified timeout', async () => {
      const tCandidate = new GossipSeed({
        host: '10.0.0.1',
        port: '2113',
      });
      const tTimeout = 1000;
      const requestEvents = {};
      let responseCallback;
      mockHttp.request = jest.fn((options, callback) => {
        responseCallback = callback;
        return {
          setTimeout: jest.fn(() => ({})),
          on: (type, callback) => {
            requestEvents[type] = callback;
          },
          end: () => {
            requestEvents['timeout']();
          },
          destroy: () => {},
        };
      });
      await expect(discoverer._clusterInfo(tCandidate, tTimeout)).rejects.toThrow(
        new Error('Connection to gossip timed out')
      );
    });

    test('Should return an error if the http request emits an error', async () => {
      const tCandidate = new GossipSeed({
        host: '10.0.0.1',
        port: '2113',
      });
      const tTimeout = 1000;
      const requestEvents = {};
      let responseCallback;
      mockHttp.request = jest.fn((options, callback) => {
        responseCallback = callback;
        return {
          setTimeout: jest.fn(() => ({})),
          on: (type, callback) => {
            requestEvents[type] = callback;
          },
          end: () => {
            requestEvents['error'](new Error('Request error'));
          },
          destroy: () => {},
        };
      });
      await expect(discoverer._clusterInfo(tCandidate, tTimeout)).rejects.toThrow(
        new Error('Connection to gossip errored')
      );
    });

    test("Should return an error if the candidate doesn't returns a 200 code", async () => {
      const tCandidate = new GossipSeed({
        host: '10.0.0.1',
        port: '2113',
      });
      const tTimeout = 1000;
      const requestEvents = {};
      let responseCallback;
      mockHttp.request = jest.fn((options, callback) => {
        responseCallback = callback;
        return {
          setTimeout: jest.fn(() => ({})),
          on: (type, callback) => {
            requestEvents[type] = callback;
          },
          end: () => {
            callback({
              statusCode: 503,
              on: (type, callback) => {
                responseEvents[type] = callback;
              },
            });
          },
          destroy: () => {},
        };
      });
      await expect(discoverer._clusterInfo(tCandidate, tTimeout)).rejects.toThrow(
        new Error('Gossip candidate returns a 503 error')
      );
    });

    test('Should return an error if the response is not a valid JSON', async () => {
      const tCandidate = new GossipSeed({
        host: '10.0.0.1',
        port: '2113',
      });
      const tTimeout = 1000;
      let responseCallback;
      const requestEvents = {};
      const responseEvents = {};
      mockHttp.request = jest.fn((options, callback) => {
        responseCallback = callback;
        return {
          setTimeout: jest.fn(() => ({})),
          on: (type, callback) => {
            requestEvents[type] = callback;
          },
          end: () => {
            callback({
              statusCode: 200,
              on: (type, callback) => {
                responseEvents[type] = callback;
              },
            });
            responseEvents['data']('Not a JSON response');
            responseEvents['end']();
          },
          destroy: () => {},
        };
      });
      await expect(discoverer._clusterInfo(tCandidate, tTimeout)).rejects.toThrow(
        new Error('Unable to parse gossip response')
      );
    });

    test('Should return the member informations for the cluster', async () => {
      const tCandidate = new GossipSeed({
        host: '10.0.0.1',
        port: '2113',
      });
      const tTimeout = 1000;
      const requestEvents = {};
      const responseEvents = {};
      mockHttp.request = jest.fn((options, callback) => {
        return {
          setTimeout: jest.fn(() => ({})),
          on: (type, callback) => {
            requestEvents[type] = callback;
          },
          end: () => {
            callback({
              statusCode: 200,
              on: (type, callback) => {
                responseEvents[type] = callback;
              },
            });
            responseEvents['data'](fs.readFileSync(path.resolve(__dirname, '../../fixtures/gossip.json')));
            responseEvents['end']();
          },
          destroy: () => {},
        };
      });
      const infos = await discoverer._clusterInfo(tCandidate, tTimeout);
      expect(infos).toEqual(tClusterInfo);
    });
  });

  describe('#_getGossipCandidates', () => {
    test('Should get from dns if gossipSeeds are empty', async () => {
      discoverer._resolveDns = jest.fn().mockResolvedValue(['10.0.0.1', '10.0.0.2', '10.0.0.3']);
      const candidates = await discoverer._getGossipCandidates(settings.managerExternalHttpPort);
      expect(discoverer._resolveDns).toHaveBeenCalled();
      expect(candidates).toHaveLength(3);
      for (let i in candidates) {
        expect(candidates[i]).toBeInstanceOf(GossipSeed);
      }
    });

    test('Should get gossipSeeds if present', async () => {
      discovererWithGossipSeeds._resolveDns = jest.fn();
      const candidates = await discovererWithGossipSeeds._getGossipCandidates(settings.managerExternalHttpPort);
      expect(discovererWithGossipSeeds._resolveDns).not.toHaveBeenCalled();
      expect(candidates).toHaveLength(3);
      for (let i in candidates) {
        expect(candidates[i]).toBeInstanceOf(GossipSeed);
      }
    });
  });

  describe('#discover', () => {
    test('Should get resolve dns discover url to get IP addresses of the eventstore node', async () => {
      discoverer._resolveDns = jest.fn().mockResolvedValue(['10.0.0.1', '10.0.0.2', '10.0.0.3']);
      discoverer._clusterInfo = jest.fn().mockResolvedValue(tClusterInfo);
      await discoverer.discover();
      expect(discoverer._resolveDns).toHaveBeenCalledWith(settings.clusterDns);
    });

    test('Should call _clusterInfo with candidate', async () => {
      discoverer._resolveDns = jest.fn().mockResolvedValue(['10.0.0.1', '10.0.0.2', '10.0.0.3']);
      discoverer._clusterInfo = jest.fn().mockResolvedValue(tClusterInfo);
      await discoverer.discover();
      expect(discoverer._clusterInfo).toHaveBeenCalledWith(
        new GossipSeed({ host: '10.0.0.1', port: settings.managerExternalHttpPort }),
        settings.gossipTimeout
      );
    });

    test('Should call _clusterInfo with candidate from gossipSeed if provided', async () => {
      discovererWithGossipSeeds._resolveDns = jest.fn().mockResolvedValue();
      discovererWithGossipSeeds._clusterInfo = jest.fn().mockResolvedValue(tClusterInfo);
      await discovererWithGossipSeeds.discover();
      expect(discovererWithGossipSeeds._resolveDns).not.toHaveBeenCalled();
    });

    test('Should return the bestNode', async () => {
      discoverer._resolveDns = jest.fn().mockResolvedValue(['10.0.0.1', '10.0.0.2', '10.0.0.3']);
      discoverer._clusterInfo = jest.fn().mockResolvedValue(tClusterInfo);
      const node = await discoverer.discover();
      expect(node).toEqual(
        new NodeEndPoints(
          {
            host: '10.0.0.3',
            port: 1113,
          },
          null
        )
      );
    });

    test('Should try to call each candidates until it get clusterInfo with bestNode', async () => {
      discoverer._resolveDns = jest.fn().mockResolvedValue(['10.0.0.1', '10.0.0.2', '10.0.0.3']);
      discoverer._clusterInfo = jest.fn().mockImplementation(async (candidate) => {
        if (candidate.endPoint.host === '10.0.0.3') {
          return tClusterInfo;
        }
        throw new Error('Gossip candidate returns a 503 error');
      });
      const node = await discoverer.discover();
      expect(node).toEqual(
        new NodeEndPoints(
          {
            host: '10.0.0.3',
            port: 1113,
          },
          null
        )
      );
      expect(discoverer._clusterInfo).toHaveBeenCalledTimes(3);
    });

    test('Should fail if the we reach the maxDiscoverAttempts limits (no bestNode is found)', async () => {
      discoverer._resolveDns = jest.fn().mockResolvedValue(['10.0.0.1', '10.0.0.2', '10.0.0.3']);
      discoverer._clusterInfo = jest.fn().mockResolvedValue(tClusterInfoNoBestNode);
      await expect(discoverer.discover()).rejects.toEqual(
        new Error(`Failed to discover candidate in ${settings.maxDiscoverAttempts} attempts.`)
      );
      expect(discoverer._resolveDns).toHaveBeenCalledTimes(settings.maxDiscoverAttempts);
      expect(discoverer._resolveDns).toHaveBeenCalledTimes(settings.maxDiscoverAttempts);
    });

    test('Should fail if the we reach the maxDiscoverAttempts limits (all resolveDns attempts fails)', async () => {
      discoverer._resolveDns = jest.fn().mockRejectedValue(new Error('Connection to gossip timed out'));
      await expect(discoverer.discover()).rejects.toEqual(
        new Error(`Failed to discover candidate in ${settings.maxDiscoverAttempts} attempts.`)
      );
      expect(discoverer._resolveDns).toHaveBeenCalledTimes(settings.maxDiscoverAttempts);
    });

    test('Should fail if the we reach the maxDiscoverAttempts limits (all clusterInfo attempts fails)', async () => {
      discoverer._resolveDns = jest.fn().mockResolvedValue(['10.0.0.1', '10.0.0.2', '10.0.0.3']);
      discoverer._clusterInfo = jest.fn().mockRejectedValue(new Error('Gossip candidate returns a 503 error'));
      await expect(discoverer.discover()).rejects.toEqual(
        new Error(`Failed to discover candidate in ${settings.maxDiscoverAttempts} attempts.`)
      );
      expect(discoverer._resolveDns).toHaveBeenCalledTimes(settings.maxDiscoverAttempts);
      expect(discoverer._resolveDns).toHaveBeenCalledTimes(settings.maxDiscoverAttempts);
    });

    test('Should try to call each candidates expect failed one until it get clusterInfo with bestNode', async () => {
      discoverer._resolveDns = jest.fn().mockResolvedValue(['10.0.0.1', '10.0.0.2', '10.0.0.3']);
      discoverer._clusterInfo = jest.fn().mockImplementation(async (candidate) => {
        if (candidate.endPoint.host === '10.0.0.3') {
          return tClusterInfo;
        }
        throw new Error('Gossip candidate returns a 503 error');
      });
      const node = await discoverer.discover({ host: '10.0.0.2', port: 2113 });
      expect(node).toEqual(
        new NodeEndPoints(
          {
            host: '10.0.0.3',
            port: 1113,
          },
          null
        )
      );
      expect(discoverer._clusterInfo).toHaveBeenCalledTimes(2);
      expect(discoverer._clusterInfo).toHaveBeenCalledWith(
        new GossipSeed({ host: '10.0.0.1', port: 2113 }),
        settings.gossipTimeout
      );
      expect(discoverer._clusterInfo).toHaveBeenCalledWith(
        new GossipSeed({ host: '10.0.0.3', port: 2113 }),
        settings.gossipTimeout
      );
    });
  });
});
