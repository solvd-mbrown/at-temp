import {BadRequestException, Inject, Injectable, Scope} from "@nestjs/common";
import {Connection} from "cypher-query-builder";
import * as cypher from "src/services/database/repository.utils";
import {CUSTOM_ERROR_MESSAGE, DATABASE_CONNECTION,} from "src/services/database/database.constants";
import {Tree} from "./entities/tree.entity";
import {UtilsRepository} from "src/utils/utils.repository";
import {UpdateTreeDto} from "./dto/update-tree.dto";
import {JoinToTreeDto} from "./dto/join-to-tree.dto";

@Injectable({scope: Scope.REQUEST})
export class TreeRepository {
    private _userId: string;
    private _updateTreeDto: UpdateTreeDto;
    private _id: number;
    private _joinToTreeProperty: JoinToTreeDto;

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly connection: Connection
    ) {
    }

    private query(): cypher.RepositoryQuery {
        return new cypher.RepositoryQuery(this.connection);
    }

    async addNewTree(treeData: { name: string; userId: number }): Promise<Tree> {
        const result = await this.query()
            .createEntity<{ [key in keyof Partial<Tree>]: any }>(
                "Tree",
                {name: treeData.name},
                true
            )
            .commitWithReturnEntity();

        await this.query()
            .createMemberRelation(treeData.userId, result.data.Tree.identity)
            .commitWithReturnEntity();

        await this.updateUserParamTreeOwner(treeData.userId);

        await this.query()
            .fetchUserByUserId(treeData.userId)
            .updateEntity(
                "User",
                Object.entries({
                    "User.myTreeIdByParent1": UtilsRepository.getStringVersion(
                        result.data.Tree.identity
                    ),
                }).reduce((valuesAcc, [key, value]) => {
                    return value !== undefined && value !== null
                        ? {
                            ...valuesAcc,
                            [key]: value,
                        }
                        : valuesAcc;
                }, {})
            )
            .commitWithReturnEntity();

        if (result) {
            const data = result.data;
            return {
                id: data.Tree.identity,
                ...data.Tree.properties,
            };
        }
        throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }

    async getTreeMembers(id: any): Promise<Tree> {
        const result = await this.query()
            .fetchAllByEntityId(id, "Tree")
            .commitWithReturnEntity();

        if (result) {
            const data = result.data;
            return {
                id: data.Tree.identity,
                ...data.Tree.properties,
                treeMembers: data.nList,
            };
        }
        throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }

    async getTree(id: any): Promise<Tree> {
        const result = await this.query()
            .fetchAllByEntityId(id, "Tree")
            .commitWithReturnEntity();

        if (result) {
            const data = result.data;
            const tree = cypher.buildTree(data, id);
            return {
                id: data.Tree.identity,
                ...data.Tree.properties,
                tree: tree[0],
            };
        }
        throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }

    async removeUserFromTree(id: number): Promise<void> {
        const result = await this.query()
            .deleteUserFromTree("User", id)
            .commitWithReturnEntity();
        if (result) {
            return;
        }
        throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }

    async removeTree(id: number): Promise<void> {
        const result = await this.query()
            .deleteEntityById("Tree", id)
            .commitWithReturnEntity();
        if (result) {
            return;
        }
        throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }

    async getTreeByUUID(id: any): Promise<Tree> {
        const result = await this.query()
            .fetchAllByEntityUUUID(id, "Tree")
            .commitWithReturnEntity();

        if (result) {
            const data = result.data;
            const tree = cypher.buildTree(data, data.Tree.identity);
            return {
                id: data.Tree.identity,
                ...data.Tree.properties,
                tree: tree[0],
            };
        }
        throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }

    private async updateUserParamTreeOwner(userId: number) {
        await this.query()
            .fetchUserByUserId(userId)
            .updateEntity(
                "User",
                Object.entries({
                    "User.myTreeIdByParent1": null,
                }).reduce((valuesAcc, [key, value]) => {
                    return value !== undefined && value !== null
                        ? {
                            ...valuesAcc,
                            [key]: value,
                        }
                        : valuesAcc;
                }, {})
            )
            .commitWithReturnEntity();
    }

    async getPartTreeByUserId(
        treeId: number,
        userId: number
    ): Promise<Tree> {
        const spouses = await this.query()
            .fetchUserByUserId(userId)
            .resolveUsersSpouseByRelationByTreeId(treeId.toString())
            .commitWithReturnEntities();
        let spouseId = null;
        if (spouses && spouses?.length && spouses[0].data.UserS) {
            spouseId = spouses[0].data.UserS.identity;
        }

        const result = await this.query()
            .fetchAllByEntityId(treeId, "Tree")
            .commitWithReturnEntity();

        if (result) {
            const data = result.data;
            const tree = cypher.buildPartTree(data, spouseId, treeId.toString());
            return {
                id: data.Tree.identity,
                ...data.Tree.properties,
                tree: tree[0],
            };
        }
        throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
    }

    async getTreeInPartsUserIdNew(treeId: number, userId: string) {
        this._userId = userId;
        return Promise.resolve(undefined);
    }

    async updateTreeEntity(id: number, updateTreeDto: UpdateTreeDto) {
        this._id = id;
        this._updateTreeDto = updateTreeDto;
        return Promise.resolve(undefined);
    }

    async joinToTreeMarried(id: number, joinToTreeProperty: JoinToTreeDto) {
        this._joinToTreeProperty = joinToTreeProperty;

    }

    private processTreeResult(result: any): any {
        // Create a map to store the nodes of the tree
        const nodesMap = new Map();
        // Create an array to store the edges of the tree
        const edges = [];
        // Iterate over the result records
        for (const record of result.records) {
            // Get the nodes and relationship from the record
            const [node1, relationship, node2] = record._fields;
            // Add the nodes to the map
            nodesMap.set(node1.identity.toString(), node1.properties);
            nodesMap.set(node2.identity.toString(), node2.properties);
            // Add the edge to the array
            edges.push({
                source: node1.identity.toString(),
                target: node2.identity.toString(),
                type: relationship.type,
            });
        }
        // Create the tree from the nodes and edges
        return this.createTreeFromNodesAndEdges(nodesMap, edges);
    }

    private createTreeFromNodesAndEdges(nodesMap: Map<string, any>, edges: any[]): any {
        // Create a map to store the children of each node
        const childrenMap = new Map();
        // Iterate over the edges
        for (const edge of edges) {
            // Get the children of the source node
            const children = childrenMap.get(edge.source) || [];
            // Add the target node to the children
            children.push(nodesMap.get(edge.target));
            // Update the children of the source node
            childrenMap.set(edge.source, children);
        }
        // Create the tree
        return this.createTreeFromChildrenMap(nodesMap, childrenMap);
    }

    private createTreeFromChildrenMap(nodesMap: Map<string, any>, childrenMap: Map<string, any[]>): any {
        // Find the root node (the node that is not a child of any other node)
        const rootNode = [...nodesMap.values()].find(node => !childrenMap.has(node.id));
        // Create the tree from the root node
        return this.createTreeFromRootNode(rootNode, childrenMap);
    }

    private createTreeFromRootNode(rootNode: any, childrenMap: Map<string, any[]>): any {
        // Create the root of the tree
        const root = {...rootNode, children: []};
        // Get the children of the root node
        const children = childrenMap.get(rootNode.id) || [];
        // Iterate over the children
        for (const childNode of children) {
            // Create the subtree from the child node
            const childTree = this.createTreeFromRootNode(childNode, childrenMap);
            // Add the subtree to the root
            root.children.push(childTree);
        }
        return root;
    }

    async joinToTreeDescendant(id: number, joinToTreeProperty: JoinToTreeDto) {
        this._joinToTreeProperty = joinToTreeProperty;


        const result = await this.query()
            .createEntity<{ [key in keyof Partial<Tree>]: any }>(
                "Tree",
                {name: this._joinToTreeProperty.name},
                true
            )
            .commitWithReturnEntity();

        await this.query()
            .createMemberRelation(this._joinToTreeProperty.userId, result.data.Tree.identity)
            .commitWithReturnEntity();


        await this.updateUserParamTreeOwner(this._joinToTreeProperty.userId);

        await this.query()
            .fetchUserByUserId(this._joinToTreeProperty.userId)
            .updateEntity(
                "User",
                Object.entries({
                    "User.myTreeIdByParent1": UtilsRepository.getStringVersion(
                        result.data.Tree.identity
                    ),
                }).reduce((valuesAcc, [key, value]) => {
                        return value !== undefined && value !== null
                            ? {
                                ...valuesAcc,
                                [key]: value,
                            }
                            : valuesAcc;

                    }
                    , {})
            )

    }

    joinToTreeAncestor = async (id: number, joinToTreeProperty: JoinToTreeDto) => {

        this._joinToTreeProperty = joinToTreeProperty;

        const result = await this.query()
            .createEntity<{ [key in keyof Partial<Tree>]: any }>(
                "Tree",
                {name: this._joinToTreeProperty.name},
                true
            )
            .commitWithReturnEntity();

        await this.query()
            .createMemberRelation(result.data.Tree.identity, this._joinToTreeProperty.userId)
            .commitWithReturnEntity();

        await this.updateUserParamTreeOwner(this._joinToTreeProperty.userId);

        await this.query()
            .fetchUserByUserId(this._joinToTreeProperty.userId)
            .updateEntity(
                "User",
                Object.entries({
                    "User.myTreeIdByParent1": UtilsRepository.getStringVersion(
                        result.data.Tree.identity
                    ),
                }).reduce((valuesAcc, [key, value]) => {
                    return value !== undefined && value !== null
                        ? {
                            ...valuesAcc,
                            [key]: value,
                        }
                        : valuesAcc;
                }, {})
            )
            .commitWithReturnEntity();

    };

    async joinToTreeMarriedSubTree(id: number, joinToTreeProperty: JoinToTreeDto) {
        this._joinToTreeProperty = joinToTreeProperty;
        return Promise.resolve(undefined);

    }
}

