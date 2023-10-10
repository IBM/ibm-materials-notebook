import { MathHelper } from "./MathHelper";
import { Vector2 } from "./Vector2";
import { Vertex } from "./Vertex";
import { Edge } from "./Edge";
import { Ring } from "./Ring";
import { Atom } from "./Atom";

/**
 * A class representing the molecular graph.
 *
 * @property {Vertex[]} vertices The vertices of the graph.
 * @property {Edge[]} edges The edges of this graph.
 * @property {Object} vertexIdsToEdgeId A map mapping vertex ids to the edge between the two vertices. The key is defined as vertexAId + '_' + vertexBId.
 * @property {Boolean} isometric A boolean indicating whether or not the SMILES associated with this graph is isometric.
 */
export class Graph {
  vertices: Vertex[];
  edges: Edge[];
  vertexIdsToEdgeId: any;
  isomeric: boolean;
  _time: number;

  /**
   * The constructor of the class Graph.
   *
   * @param {Object} parseTree A SMILES parse tree.
   * @param {Boolean} [isomeric=false] A boolean specifying whether or not the SMILES is isomeric.
   */
  constructor(parseTree: any, isomeric = false) {
    this.vertices = [];
    this.edges = [];
    this.vertexIdsToEdgeId = {};
    this.isomeric = isomeric;

    // Used for the bridge detection algorithm
    this._time = 0;
    this._init(parseTree);
  }

  /**
   * PRIVATE FUNCTION. Initializing the graph from the parse tree.
   *
   * @param {Object} node The current node in the parse tree.
   * @param {Number} parentVertexId=null The id of the previous vertex.
   * @param {Boolean} isBranch=false Whether or not the bond leading to this vertex is a branch bond. Branches are represented by parentheses in smiles (e.g. CC(O)C).
   */
  _init(
    node: any,
    order = 0,
    parentVertexId: number | null = null,
    isBranch = false
  ) {
    // Create a new vertex object
    const atom = new Atom(
      node.atom.element ? node.atom.element : node.atom,
      node.bond
    );

    atom.branchBond = node.branchBond;
    atom.ringbonds = node.ringbonds;
    atom.bracket = node.atom.element ? node.atom : null;
    atom.class = node.atom.class;

    const vertex = new Vertex(atom);
    const parentVertex = this.vertices[parentVertexId as number];

    this.addVertex(vertex);

    // Add the id of this node to the parent as child
    if (parentVertexId !== null) {
      vertex.setParentVertexId(parentVertexId);
      vertex.value.addNeighbouringElement(parentVertex.value.element);
      parentVertex.addChild(vertex.id as number);
      parentVertex.value.addNeighbouringElement(atom.element);

      // In addition create a spanningTreeChildren property, which later will
      // not contain the children added through ringbonds
      parentVertex.spanningTreeChildren.push(vertex.id as number);

      // Add edge between this node and its parent
      const edge = new Edge(parentVertexId, vertex.id as number, 1);
      let vertexId = null;

      if (isBranch) {
        edge.setBondType(vertex.value.branchBond || "-");
        vertexId = vertex.id;
        edge.setBondType(vertex.value.branchBond || "-");
        vertexId = vertex.id;
      } else {
        edge.setBondType(parentVertex.value.bondType || "-");
        vertexId = parentVertex.id;
      }

      const edgeId = this.addEdge(edge);
    }

    let offset = node.ringbondCount + 1;

    if (atom.bracket) {
      offset += atom.bracket.hcount;
    }

    let stereoHydrogens = 0;
    if (atom.bracket && atom.bracket.chirality) {
      atom.isStereoCenter = true;
      stereoHydrogens = atom.bracket.hcount;
      for (let i = 0; i < stereoHydrogens; i++) {
        this._init(
          {
            atom: "H",
            isBracket: "false",
            branches: [],
            branchCount: 0,
            ringbonds: [],
            ringbondCount: false,
            next: null,
            hasNext: false,
            bond: "-",
          },
          i,
          vertex.id,
          true
        );
      }
    }

    for (let i = 0; i < node.branchCount; i++) {
      this._init(node.branches[i], i + offset, vertex.id, true);
    }

    if (node.hasNext) {
      this._init(node.next, node.branchCount + offset, vertex.id);
    }
  }

  /**
   * Clears all the elements in this graph (edges and vertices).
   */
  clear() {
    this.vertices = [];
    this.edges = [];
    this.vertexIdsToEdgeId = {};
  }

  /**
   * Add a vertex to the graph.
   *
   * @param {Vertex} vertex A new vertex.
   * @returns {Number} The vertex id of the new vertex.
   */
  addVertex(vertex: Vertex) {
    vertex.id = this.vertices.length;
    this.vertices.push(vertex);

    return vertex.id;
  }

  /**
   * Add an edge to the graph.
   *
   * @param {Edge} edge A new edge.
   * @returns {Number} The edge id of the new edge.
   */
  addEdge(edge: Edge) {
    const source = this.vertices[edge.sourceId];
    const target = this.vertices[edge.targetId];

    edge.id = this.edges.length;
    this.edges.push(edge);

    this.vertexIdsToEdgeId[edge.sourceId + "_" + edge.targetId] = edge.id;
    this.vertexIdsToEdgeId[edge.targetId + "_" + edge.sourceId] = edge.id;
    edge.isPartOfAromaticRing =
      source.value.isPartOfAromaticRing && target.value.isPartOfAromaticRing;

    source.value.bondCount += edge.weight;
    target.value.bondCount += edge.weight;

    source.edges.push(edge.id);
    target.edges.push(edge.id);

    return edge.id;
  }

  /**
   * Returns the edge between two given vertices.
   *
   * @param {Number} vertexIdA A vertex id.
   * @param {Number} vertexIdB A vertex id.
   * @returns {(Edge|null)} The edge or, if no edge can be found, null.
   */
  getEdge(vertexIdA: number, vertexIdB: number) {
    const edgeId = this.vertexIdsToEdgeId[vertexIdA + "_" + vertexIdB];

    return edgeId === undefined ? null : this.edges[edgeId];
  }

  /**
   * Returns the ids of edges connected to a vertex.
   *
   * @param {Number} vertexId A vertex id.
   * @returns {Number[]} An array containing the ids of edges connected to the vertex.
   */
  getEdges(vertexId: number) {
    const edgeIds = [];
    const vertex = this.vertices[vertexId];

    for (let i = 0; i < vertex.neighbours.length; i++) {
      edgeIds.push(
        this.vertexIdsToEdgeId[vertexId + "_" + vertex.neighbours[i]]
      );
    }

    return edgeIds;
  }

  /**
   * Check whether or not two vertices are connected by an edge.
   *
   * @param {Number} vertexIdA A vertex id.
   * @param {Number} vertexIdB A vertex id.
   * @returns {Boolean} A boolean indicating whether or not two vertices are connected by an edge.
   */
  hasEdge(vertexIdA: number, vertexIdB: number) {
    return this.vertexIdsToEdgeId[vertexIdA + "_" + vertexIdB] !== undefined;
  }

  /**
   * Returns an array containing the vertex ids of this graph.
   *
   * @returns {Number[]} An array containing all vertex ids of this graph.
   */
  getVertexList() {
    const arr = [this.vertices.length];

    for (let i = 0; i < this.vertices.length; i++) {
      arr[i] = this.vertices[i].id as number;
    }

    return arr;
  }

  /**
   * Returns an array containing source, target arrays of this graphs edges.
   *
   * @returns {Array[]} An array containing source, target arrays of this graphs edges. Example: [ [ 2, 5 ], [ 6, 9 ] ].
   */
  getEdgeList() {
    const arr = Array(this.edges.length);

    for (let i = 0; i < this.edges.length; i++) {
      arr[i] = [this.edges[i].sourceId, this.edges[i].targetId];
    }

    return arr;
  }

  /**
   * Get the adjacency matrix of the graph.
   *
   * @returns {Array[]} The adjancency matrix of the molecular graph.
   */
  getAdjacencyMatrix() {
    const length = this.vertices.length;
    const adjacencyMatrix = Array(length);

    for (let i = 0; i < length; i++) {
      adjacencyMatrix[i] = new Array(length);
      adjacencyMatrix[i].fill(0);
    }

    for (let i = 0; i < this.edges.length; i++) {
      const edge = this.edges[i];

      adjacencyMatrix[edge.sourceId][edge.targetId] = 1;
      adjacencyMatrix[edge.targetId][edge.sourceId] = 1;
    }

    return adjacencyMatrix;
  }

  /**
   * Get the adjacency matrix of the graph with all bridges removed (thus the components). Thus the remaining vertices are all part of ring systems.
   *
   * @returns {Array[]} The adjancency matrix of the molecular graph with all bridges removed.
   */
  getComponentsAdjacencyMatrix() {
    const length = this.vertices.length;
    const adjacencyMatrix = Array(length);
    const bridges = this.getBridges();

    for (let i = 0; i < length; i++) {
      adjacencyMatrix[i] = new Array(length);
      adjacencyMatrix[i].fill(0);
    }

    for (let i = 0; i < this.edges.length; i++) {
      const edge = this.edges[i];

      adjacencyMatrix[edge.sourceId][edge.targetId] = 1;
      adjacencyMatrix[edge.targetId][edge.sourceId] = 1;
    }

    for (let i = 0; i < bridges.length; i++) {
      adjacencyMatrix[bridges[i][0]][bridges[i][1]] = 0;
      adjacencyMatrix[bridges[i][1]][bridges[i][0]] = 0;
    }

    return adjacencyMatrix;
  }

  /**
   * Get the adjacency matrix of a subgraph.
   *
   * @param {Number[]} vertexIds An array containing the vertex ids contained within the subgraph.
   * @returns {Array[]} The adjancency matrix of the subgraph.
   */
  getSubgraphAdjacencyMatrix(vertexIds: number[]) {
    const length = vertexIds.length;
    const adjacencyMatrix = Array(length);

    for (let i = 0; i < length; i++) {
      adjacencyMatrix[i] = new Array(length);
      adjacencyMatrix[i].fill(0);

      for (let j = 0; j < length; j++) {
        if (i === j) {
          continue;
        }

        if (this.hasEdge(vertexIds[i], vertexIds[j])) {
          adjacencyMatrix[i][j] = 1;
        }
      }
    }

    return adjacencyMatrix;
  }

  /**
   * Get the distance matrix of the graph.
   *
   * @returns {Array[]} The distance matrix of the graph.
   */
  getDistanceMatrix() {
    const length = this.vertices.length;
    const adja = this.getAdjacencyMatrix();
    const dist = Array(length);

    for (let i = 0; i < length; i++) {
      dist[i] = Array(length);
      dist[i].fill(Infinity);
    }

    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length; j++) {
        if (adja[i][j] === 1) {
          dist[i][j] = 1;
        }
      }
    }

    for (let k = 0; k < length; k++) {
      for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
          if (dist[i][j] > dist[i][k] + dist[k][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
          }
        }
      }
    }

    return dist;
  }

  /**
   * Get the distance matrix of a subgraph.
   *
   * @param {Number[]} vertexIds An array containing the vertex ids contained within the subgraph.
   * @returns {Array[]} The distance matrix of the subgraph.
   */
  getSubgraphDistanceMatrix(vertexIds: number[]) {
    const length = vertexIds.length;
    const adja = this.getSubgraphAdjacencyMatrix(vertexIds);
    const dist = Array(length);

    for (let i = 0; i < length; i++) {
      dist[i] = Array(length);
      dist[i].fill(Infinity);
    }

    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length; j++) {
        if (adja[i][j] === 1) {
          dist[i][j] = 1;
        }
      }
    }

    for (let k = 0; k < length; k++) {
      for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
          if (dist[i][j] > dist[i][k] + dist[k][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
          }
        }
      }
    }

    return dist;
  }

  /**
   * Get the adjacency list of the graph.
   *
   * @returns {Array[]} The adjancency list of the graph.
   */
  getAdjacencyList() {
    const length = this.vertices.length;
    const adjacencyList = Array(length);

    for (let i = 0; i < length; i++) {
      adjacencyList[i] = [];

      for (let j = 0; j < length; j++) {
        if (i === j) {
          continue;
        }

        if (
          this.hasEdge(
            this.vertices[i].id as number,
            this.vertices[j].id as number
          )
        ) {
          adjacencyList[i].push(j);
        }
      }
    }

    return adjacencyList;
  }

  /**
   * Get the adjacency list of a subgraph.
   *
   * @param {Number[]} vertexIds An array containing the vertex ids contained within the subgraph.
   * @returns {Array[]} The adjancency list of the subgraph.
   */
  getSubgraphAdjacencyList(vertexIds: number[]) {
    const length = vertexIds.length;
    const adjacencyList = Array(length);

    for (let i = 0; i < length; i++) {
      adjacencyList[i] = [];

      for (let j = 0; j < length; j++) {
        if (i === j) {
          continue;
        }

        if (this.hasEdge(vertexIds[i], vertexIds[j])) {
          adjacencyList[i].push(j);
        }
      }
    }

    return adjacencyList;
  }

  /**
   * Returns an array containing the edge ids of bridges. A bridge splits the graph into multiple components when removed.
   *
   * @returns {Number[]} An array containing the edge ids of the bridges.
   */
  getBridges() {
    const length = this.vertices.length;
    const visited = new Array(length);
    const disc = new Array(length);
    const low = new Array(length);
    const parent = new Array(length);
    const adj = this.getAdjacencyList();
    const outBridges: any[] = [];

    visited.fill(false);
    parent.fill(null);
    this._time = 0;

    for (let i = 0; i < length; i++) {
      if (!visited[i]) {
        this._bridgeDfs(i, visited, disc, low, parent, adj, outBridges);
      }
    }

    return outBridges;
  }

  /**
   * Traverses the graph in breadth-first order.
   *
   * @param {Number} startVertexId The id of the starting vertex.
   * @param {Function} callback The callback function to be called on every vertex.
   */
  traverseBF(startVertexId: number, callback: any) {
    const length = this.vertices.length;
    const visited = new Array(length);

    visited.fill(false);

    const queue = [startVertexId];

    while (queue.length > 0) {
      // JavaScripts shift() is O(n) ... bad JavaScript, bad!
      const u = queue.shift();
      const vertex = this.vertices[u as number];

      callback(vertex);

      for (let i = 0; i < vertex.neighbours.length; i++) {
        const v = vertex.neighbours[i];
        if (!visited[v]) {
          visited[v] = true;
          queue.push(v);
        }
      }
    }
  }

  /**
   * Get the depth of a subtree in the direction opposite to the vertex specified as the parent vertex.
   *
   * @param {Number} vertexId A vertex id.
   * @param {Number} parentVertexId The id of a neighbouring vertex.
   * @returns {Number} The depth of the sub-tree.
   */
  getTreeDepth(vertexId: number, parentVertexId: number) {
    if (vertexId === null || parentVertexId === null) {
      return 0;
    }

    const neighbours =
      this.vertices[vertexId].getSpanningTreeNeighbours(parentVertexId);
    let max = 0;

    for (let i = 0; i < neighbours.length; i++) {
      const childId = neighbours[i];
      const d = this.getTreeDepth(childId, vertexId);

      if (d > max) {
        max = d;
      }
    }

    return max + 1;
  }

  /**
   * Traverse a sub-tree in the graph.
   *
   * @param {Number} vertexId A vertex id.
   * @param {Number} parentVertexId A neighbouring vertex.
   * @param {Function} callback The callback function that is called with each visited as an argument.
   * @param {Number} [maxDepth=999999] The maximum depth of the recursion.
   * @param {Boolean} [ignoreFirst=false] Whether or not to ignore the starting vertex supplied as vertexId in the callback.
   * @param {Number} [depth=1] The current depth in the tree.
   * @param {Uint8Array} [visited=null] An array holding a flag on whether or not a node has been visited.
   */
  traverseTree(
    vertexId: number,
    parentVertexId: number,
    callback: any,
    maxDepth = 999999,
    ignoreFirst = false,
    depth = 1,
    visited: Uint8Array | null = null
  ) {
    if (visited === null) {
      visited = new Uint8Array(this.vertices.length);
    }

    if (depth > maxDepth + 1 || visited[vertexId] === 1) {
      return;
    }

    visited[vertexId] = 1;

    const vertex = this.vertices[vertexId];
    const neighbours = vertex.getNeighbours(parentVertexId);

    if (!ignoreFirst || depth > 1) {
      callback(vertex);
    }

    for (let i = 0; i < neighbours.length; i++) {
      this.traverseTree(
        neighbours[i],
        vertexId,
        callback,
        maxDepth,
        ignoreFirst,
        depth + 1,
        visited
      );
    }
  }

  /**
   * Positiones the (sub)graph using Kamada and Kawais algorithm for drawing general undirected graphs. https://pdfs.semanticscholar.org/b8d3/bca50ccc573c5cb99f7d201e8acce6618f04.pdf
   * There are undocumented layout parameters. They are undocumented for a reason, so be very careful.
   *
   * @param {Number[]} vertexIds An array containing vertexIds to be placed using the force based layout.
   * @param {Vector2} center The center of the layout.
   * @param {Number} startVertexId A vertex id. Should be the starting vertex - e.g. the first to be positioned and connected to a previously place vertex.
   * @param {Ring} ring The bridged ring associated with this force-based layout.
   */
  kkLayout(
    vertexIds: number[],
    center: Vector2,
    startVertexId: number,
    ring: Ring,
    bondLength: any,
    threshold = 0.1,
    innerThreshold = 0.1,
    maxIteration = 2000,
    maxInnerIteration = 50,
    maxEnergy = 1e9
  ) {
    const edgeStrength = bondLength;

    // Add vertices that are directly connected to the ring
    let i = vertexIds.length;
    while (i--) {
      const vertex = this.vertices[vertexIds[i]];
      let j = vertex.neighbours.length;
    }

    const matDist = this.getSubgraphDistanceMatrix(vertexIds);
    const length = vertexIds.length;

    // Initialize the positions. Place all vertices on a ring around the center
    const radius = MathHelper.polyCircumradius(500, length);
    const angle = MathHelper.centralAngle(length);
    let a = 0.0;
    const arrPositionX = new Float32Array(length);
    const arrPositionY = new Float32Array(length);
    const arrPositioned = Array(length);

    i = length;
    while (i--) {
      const vertex = this.vertices[vertexIds[i]];
      if (!vertex.positioned) {
        arrPositionX[i] = center.x + Math.cos(a) * radius;
        arrPositionY[i] = center.y + Math.sin(a) * radius;
      } else {
        arrPositionX[i] = vertex.position.x;
        arrPositionY[i] = vertex.position.y;
      }
      arrPositioned[i] = vertex.positioned;
      a += angle;
    }

    // Create the matrix containing the lengths
    const matLength = Array(length);
    i = length;
    while (i--) {
      matLength[i] = new Array(length);
      let j = length;
      while (j--) {
        matLength[i][j] = bondLength * matDist[i][j];
      }
    }

    // Create the matrix containing the spring strenghts
    const matStrength = Array(length);
    i = length;
    while (i--) {
      matStrength[i] = Array(length);
      let j = length;
      while (j--) {
        matStrength[i][j] = edgeStrength * Math.pow(matDist[i][j], -2.0);
      }
    }

    // Create the matrix containing the energies
    const matEnergy = Array(length);
    const arrEnergySumX = new Float32Array(length);
    const arrEnergySumY = new Float32Array(length);
    i = length;
    while (i--) {
      matEnergy[i] = Array(length);
    }

    i = length;
    let ux, uy, dEx, dEy, vx, vy, denom;

    while (i--) {
      ux = arrPositionX[i];
      uy = arrPositionY[i];
      dEx = 0.0;
      dEy = 0.0;
      let j = length;
      while (j--) {
        if (i === j) {
          continue;
        }
        vx = arrPositionX[j];
        vy = arrPositionY[j];
        denom = 1.0 / Math.sqrt((ux - vx) * (ux - vx) + (uy - vy) * (uy - vy));
        matEnergy[i][j] = [
          matStrength[i][j] * (ux - vx - matLength[i][j] * (ux - vx) * denom),
          matStrength[i][j] * (uy - vy - matLength[i][j] * (uy - vy) * denom),
        ];
        matEnergy[j][i] = matEnergy[i][j];
        dEx += matEnergy[i][j][0];
        dEy += matEnergy[i][j][1];
      }
      arrEnergySumX[i] = dEx;
      arrEnergySumY[i] = dEy;
    }

    // Utility functions, maybe inline them later
    const energy = function (index: number) {
      return [
        arrEnergySumX[index] * arrEnergySumX[index] +
          arrEnergySumY[index] * arrEnergySumY[index],
        arrEnergySumX[index],
        arrEnergySumY[index],
      ];
    };

    const highestEnergy = function () {
      let maxEnergy = 0.0;
      let maxEnergyId = 0;
      let maxDEX = 0.0;
      let maxDEY = 0.0;

      i = length;
      while (i--) {
        const [delta, dEX, dEY] = energy(i);

        if (delta > maxEnergy && arrPositioned[i] === false) {
          maxEnergy = delta;
          maxEnergyId = i;
          maxDEX = dEX;
          maxDEY = dEY;
        }
      }

      return [maxEnergyId, maxEnergy, maxDEX, maxDEY];
    };

    const update = function (index: number, dEX: number, dEY: number) {
      let dxx = 0.0;
      let dyy = 0.0;
      let dxy = 0.0;
      let ux = arrPositionX[index];
      let uy = arrPositionY[index];
      const arrL = matLength[index];
      const arrK = matStrength[index];

      i = length;
      while (i--) {
        if (i === index) {
          continue;
        }

        const vx = arrPositionX[i];
        const vy = arrPositionY[i];
        const l = arrL[i];
        const k = arrK[i];
        const m = (ux - vx) * (ux - vx);
        const denom = 1.0 / Math.pow(m + (uy - vy) * (uy - vy), 1.5);

        dxx += k * (1 - l * (uy - vy) * (uy - vy) * denom);
        dyy += k * (1 - l * m * denom);
        dxy += k * (l * (ux - vx) * (uy - vy) * denom);
      }

      // Prevent division by zero
      if (dxx === 0) {
        dxx = 0.1;
      }

      if (dyy === 0) {
        dyy = 0.1;
      }

      if (dxy === 0) {
        dxy = 0.1;
      }

      let dy = dEX / dxx + dEY / dxy;
      dy /= dxy / dxx - dyy / dxy; // had to split this onto two lines because the syntax highlighter went crazy.
      let dx = -(dxy * dy + dEX) / dxx;

      arrPositionX[index] += dx;
      arrPositionY[index] += dy;

      // Update the energies
      const arrE = matEnergy[index];
      dEX = 0.0;
      dEY = 0.0;

      ux = arrPositionX[index];
      uy = arrPositionY[index];

      let vx, vy, prevEx, prevEy, denom;

      i = length;
      while (i--) {
        if (index === i) {
          continue;
        }
        vx = arrPositionX[i];
        vy = arrPositionY[i];
        // Store old energies
        prevEx = arrE[i][0];
        prevEy = arrE[i][1];
        denom = 1.0 / Math.sqrt((ux - vx) * (ux - vx) + (uy - vy) * (uy - vy));
        dx = arrK[i] * (ux - vx - arrL[i] * (ux - vx) * denom);
        dy = arrK[i] * (uy - vy - arrL[i] * (uy - vy) * denom);

        arrE[i] = [dx, dy];
        dEX += dx;
        dEY += dy;
        arrEnergySumX[i] += dx - prevEx;
        arrEnergySumY[i] += dy - prevEy;
      }
      arrEnergySumX[index] = dEX;
      arrEnergySumY[index] = dEY;
    };

    // Setting up variables for the while loops
    let maxEnergyId = 0;
    let dEX = 0.0;
    let dEY = 0.0;
    let delta = 0.0;
    let iteration = 0;
    let innerIteration = 0;

    while (maxEnergy > threshold && maxIteration > iteration) {
      iteration++;
      [maxEnergyId, maxEnergy, dEX, dEY] = highestEnergy();
      delta = maxEnergy;
      innerIteration = 0;
      while (delta > innerThreshold && maxInnerIteration > innerIteration) {
        innerIteration++;
        update(maxEnergyId, dEX, dEY);
        [delta, dEX, dEY] = energy(maxEnergyId);
      }
    }

    i = length;
    while (i--) {
      const index = vertexIds[i];
      const vertex = this.vertices[index];
      vertex.position.x = arrPositionX[i];
      vertex.position.y = arrPositionY[i];
      vertex.positioned = true;
      vertex.forcePositioned = true;
    }
  }

  /**
   * PRIVATE FUNCTION used by getBridges().
   */
  _bridgeDfs(
    u: any,
    visited: any,
    disc: any,
    low: any,
    parent: any,
    adj: any,
    outBridges: any
  ) {
    visited[u] = true;
    disc[u] = low[u] = ++this._time;

    for (let i = 0; i < adj[u].length; i++) {
      const v = adj[u][i];

      if (!visited[v]) {
        parent[v] = u;

        this._bridgeDfs(v, visited, disc, low, parent, adj, outBridges);

        low[u] = Math.min(low[u], low[v]);

        // If low > disc, we have a bridge
        if (low[v] > disc[u]) {
          outBridges.push([u, v]);
        }
      } else if (v !== parent[u]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }

  /**
   * Returns the connected components of the graph.
   *
   * @param {Array[]} adjacencyMatrix An adjacency matrix.
   * @returns {Set[]} Connected components as sets.
   */
  static getConnectedComponents(adjacencyMatrix: any[][]) {
    const length = adjacencyMatrix.length;
    const visited = new Array(length);
    const components = [];
    let count = 0;

    visited.fill(false);

    for (let u = 0; u < length; u++) {
      if (!visited[u]) {
        const component = [];
        visited[u] = true;
        component.push(u);
        count++;
        Graph._ccGetDfs(u, visited, adjacencyMatrix, component);
        if (component.length > 1) {
          components.push(component);
        }
      }
    }

    return components;
  }

  /**
   * Returns the number of connected components for the graph.
   *
   * @param {Array[]} adjacencyMatrix An adjacency matrix.
   * @returns {Number} The number of connected components of the supplied graph.
   */
  static getConnectedComponentCount(adjacencyMatrix: any[][]) {
    const length = adjacencyMatrix.length;
    const visited = new Array(length);
    let count = 0;

    visited.fill(false);

    for (let u = 0; u < length; u++) {
      if (!visited[u]) {
        visited[u] = true;
        count++;
        Graph._ccCountDfs(u, visited, adjacencyMatrix);
      }
    }

    return count;
  }

  /**
   * PRIVATE FUNCTION used by getConnectedComponentCount().
   */
  static _ccCountDfs(u: any, visited: any, adjacencyMatrix: any[][]) {
    for (let v = 0; v < adjacencyMatrix[u].length; v++) {
      const c = adjacencyMatrix[u][v];

      if (!c || visited[v] || u === v) {
        continue;
      }

      visited[v] = true;
      Graph._ccCountDfs(v, visited, adjacencyMatrix);
    }
  }

  /**
   * PRIVATE FUNCTION used by getConnectedComponents().
   */
  static _ccGetDfs(
    u: any,
    visited: any,
    adjacencyMatrix: any[][],
    component: any
  ) {
    for (let v = 0; v < adjacencyMatrix[u].length; v++) {
      const c = adjacencyMatrix[u][v];

      if (!c || visited[v] || u === v) {
        continue;
      }

      visited[v] = true;
      component.push(v);
      Graph._ccGetDfs(v, visited, adjacencyMatrix, component);
    }
  }
}
