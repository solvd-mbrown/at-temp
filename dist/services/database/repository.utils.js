"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapCypherResultToEntity = exports.Return = exports.buildTreeFromRelations = exports.getRootUser = exports.removeDuplicates = exports.getMarriedRel = exports.getDescendantRel = exports.buildTree = exports.processArrayProperty = exports.processEntityIds = exports.processEmptyNestedArray = exports.addUpdateDateToProperties = exports.addUuidToProperties = exports.addCreateDateToProperties = exports.RepositoryQuery = void 0;
const cypher_query_builder_1 = require("cypher-query-builder");
const uuid_1 = require("uuid");
const convert = (propertyName, propertyValue) => {
    if (Array.isArray(propertyValue)) {
        return `${propertyName} IN [${propertyValue.map((value) => typeof value === 'string' ? `"${value}"` : value)}]`;
    }
    else {
        return `${propertyName} = ${propertyValue}`;
    }
};
class RepositoryQuery {
    constructor(connection) {
        this.connection = connection;
        this.dependencies = new Set();
        this.returns = [];
        this.moveEntityToParent = (childEntity, parentEntity, id) => {
            this.dependencies.add(`${childEntity}`);
            this.query.raw(`  
                MATCH (target${parentEntity}:${parentEntity}) WHERE ID(target${parentEntity}) = ${id}
                MERGE (target${parentEntity})-[target${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})
            `);
            this.setPropertyOnEntity(childEntity, {});
            this.customWith('*');
            this.returns.push(`${childEntity}`);
            return this;
        };
        this.removeRelationFromEntityToParent = (childEntity, parentEntity) => {
            this.dependencies.add(`${childEntity}`);
            this.query.raw(`
                OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]-(${childEntity})
                DELETE ${parentEntity}${childEntity}Relation
                WITH *
            `);
            return this;
        };
        this.resolveEntityByInternalRelation = (childEntity, parentEntity) => {
            this.dependencies.add(childEntity);
            this.query.raw(`
      OPTIONAL MATCH (${parentEntity})-[:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
    `);
            return this;
        };
        this.resolveInternalRelations = (childEntity, parentEntity, ids, findArchived = false, customWith = `*`) => {
            if ((ids === null || ids === void 0 ? void 0 : ids.length) > 0) {
                this.dependencies.add(`${childEntity}List`);
                this.query.raw(`  
                OPTIONAL MATCH (${parentEntity})-[removed${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(removed${childEntity}List:${childEntity}) 
                DELETE removed${childEntity}Relations
                WITH *
                OPTIONAL MATCH (${childEntity}List:${childEntity}) WHERE ID(${childEntity}List) in [${(0, exports.processEntityIds)(ids)}]

                ${this.findWhereConditions(childEntity + 'List', parentEntity, undefined, findArchived)}
                MERGE (${parentEntity})-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}List)
                WITH ${customWith}
            `);
                this.returns.push(`${childEntity}List`);
            }
            else if ((ids === null || ids === void 0 ? void 0 : ids.length) == 0) {
                this.query.raw(`  
                OPTIONAL MATCH (${parentEntity})-[removed${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(removed${childEntity}List:${childEntity}) 
                DELETE removed${childEntity}Relations
                WITH ${customWith}
            `);
            }
            else {
                this.attachInternalEntitiesByParent(childEntity, parentEntity);
            }
            return this;
        };
        this.resolveExternalRelations = (childEntity, parentEntity, ids) => {
            if ((ids === null || ids === void 0 ? void 0 : ids.length) > 0) {
                this.dependencies.add(`${childEntity}List`);
                this.query.raw(`  
                OPTIONAL MATCH (${parentEntity})<-[removed${childEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(removed${childEntity}List:${childEntity}) 
                DELETE removed${childEntity}Relations
                WITH *
                OPTIONAL MATCH (${childEntity}List:${childEntity}) WHERE ID(${childEntity}List) in [${(0, exports.processEntityIds)(ids)}]
                ${this.findWhereConditions(childEntity + 'List', parentEntity)}
                MERGE (${parentEntity})<-[${parentEntity}${childEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(${childEntity}List)
                WITH *
            `);
                this.returns.push(`${childEntity}List`);
            }
            else if ((ids === null || ids === void 0 ? void 0 : ids.length) == 0) {
                this.query.raw(`  
                OPTIONAL MATCH (${parentEntity})<-[removed${childEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(removed${childEntity}List:${childEntity}) 
                DELETE removed${childEntity}Relations
                WITH *
            `);
            }
            else {
                this.attachExternalEntitiesByParent(childEntity, parentEntity);
            }
            return this;
        };
        this.resolveExternalRelation = (childEntity, parentEntity, id, attachArchived = false) => {
            if (id) {
                this.dependencies.add(`${childEntity}`);
                this.query.raw(`  
                OPTIONAL MATCH (${parentEntity})<-[removed${childEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(removed${childEntity}:${childEntity}) 
                DELETE removed${childEntity}Relations
                WITH *
                OPTIONAL MATCH (${childEntity}:${childEntity}) WHERE ID(${childEntity}) = ${id}
                ${this.findWhereConditions(childEntity, parentEntity)}
                MERGE (${parentEntity})<-[${parentEntity}${childEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(${childEntity})
                WITH *
            `);
                this.returns.push(`${childEntity}`);
            }
            else {
                this.attachExternalEntityByParent(childEntity, parentEntity, attachArchived);
            }
            return this;
        };
        this.setWorkspaceHistoryEntityByParent = (childEntity, parentEntity, workspaceHistoryId, workspaceId) => {
            this.dependencies.add(`${childEntity}`);
            let query = `MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]-(${childEntity}:${childEntity})

    `;
            if (workspaceId) {
                query += `
      SET ${childEntity}.workspaceId = ${workspaceId}
      SET ${childEntity}.workspaceIdHistory = ${workspaceHistoryId}
      `;
            }
            query += `WITH *`;
            this.query.raw(query);
            return this;
        };
        this.unionCallProcessing = (subQueries, returnEntities) => {
            const entities = [];
            const entityDefinitions = [];
            for (const [entity, definition] of returnEntities) {
                entities.push(entity);
                entityDefinitions.push(definition || entity);
            }
            entities.forEach((entity) => this.dependencies.add(entity));
            this.query.raw(`
        CALL {
          ${subQueries
                .map((sub) => `
                ${sub.query
                .raw('WITH *')
                .return(entityDefinitions)
                .build()
                .replace(';', '')}`)
                .join(' UNION ')}
        }
      `);
            this.returns.push(...entities);
            return this;
        };
        this.query = connection.query();
    }
    addDependencies(deps, willReturn = false) {
        deps.forEach((d) => {
            this.dependencies.add(`${d}`);
            if (willReturn) {
                this.returns.push(`${d}`);
            }
        });
        return this;
    }
    beginWithUser(id) {
        this.dependencies.add('User');
        this.query = this.connection
            .match([
            (0, cypher_query_builder_1.node)('User', 'User', {
                id: id,
            }),
        ])
            .with([...this.dependencies.values()].join(','));
        this.returns.push('User');
        return this;
    }
    attachExternalEntitiesByParent(childEntity, parentEntity, attachArchived = false) {
        this.query.raw(` 
        WITH *
        OPTIONAL MATCH (${parentEntity})<-[${childEntity}${parentEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(${childEntity}List:${childEntity})
        ${!attachArchived
            ? this.findWhereArchivedConditions(childEntity + 'List', parentEntity, true)
            : ''}`);
        this.returns.push(`${childEntity}List`);
        return this;
    }
    fetchAllByEntityId(entityId, entity) {
        this.query.raw(`MATCH (${entity}:${entity}) WHERE ID(${entity}) = ${entityId}
       MATCH (${entity})-[rList*..10]-(nList)`);
        this.returns.push(`${entity}`, 'rList', 'nList');
        return this;
    }
    fetchDescendantTreeByUserId(userId) {
        this.query.raw(`MATCH (User:User) WHERE ID(User) = ${userId}
       MATCH (User)-[rList:USER_DESCENDANT_USER*..10]-(nList)`);
        this.returns.push(`User`, 'rList', 'nList');
        return this;
    }
    attachExternalEntityByParent(childEntity, parentEntity, attachArchived = false) {
        this.query.raw(` 
        WITH *
        OPTIONAL MATCH (${parentEntity})<-[${childEntity}${parentEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(${childEntity}:${childEntity})
        ${!attachArchived
            ? this.findWhereArchivedConditions(childEntity, parentEntity, true)
            : ''}`);
        this.returns.push(`${childEntity}`);
        return this;
    }
    attachExternalEntityByParentList(childEntity, parentEntity) {
        this.dependencies.add(childEntity);
        this.query.raw(` 
        WITH *
        OPTIONAL MATCH (${parentEntity}List)<-[${childEntity}${parentEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(${childEntity}:${childEntity})
        ${this.findWhereArchivedConditions(childEntity, parentEntity, true)}`);
        this.returns.push(`${childEntity}`);
        return this;
    }
    attachInternalEntitiesByParent(childEntity, parentEntity, attachArchived = false) {
        this.dependencies.add(`${childEntity}List`);
        this.query.raw(` 
        WITH *
        OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}List:${childEntity})
        ${attachArchived
            ? ''
            : this.findWhereArchivedConditions(childEntity + 'List', parentEntity, true)}`);
        this.returns.push(`${childEntity}List`);
        return this;
    }
    attachInternalEntityParentListByChildLabel(childEntity, parentEntity, attachArchived = false) {
        this.dependencies.add(`${childEntity}`);
        this.query.raw(` 
        WITH *
        OPTIONAL MATCH (${parentEntity}List:${parentEntity})-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})
        ${!attachArchived
            ? this.findWhereArchivedConditions(childEntity, parentEntity, true)
            : ''}`);
        this.returns.push(`${childEntity}`);
        return this;
    }
    attachInternalEntityByParent(childEntity, parentEntity, attachArchived = false) {
        this.dependencies.add(`${childEntity}`);
        this.query.raw(` 
        WITH *
        OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
        ${!attachArchived
            ? this.findWhereArchivedConditions(childEntity, parentEntity, true)
            : ''}`);
        this.returns.push(`${childEntity}`);
        return this;
    }
    attachInternalEntitiesByParentList(childEntity, parentEntity, deps = ['*'], alias) {
        this.dependencies.add((alias || childEntity) + 'List');
        this.query.raw(` 
        WITH ${deps.join(',')}
        OPTIONAL MATCH (${parentEntity}List)-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${alias || childEntity}List:${childEntity})
        ${this.findWhereArchivedConditions((alias || childEntity) + 'List', parentEntity + 'List', true)}
        `);
        this.returns.push(`${alias || childEntity}List`);
        return this;
    }
    callStart() {
        this.query.raw(`CALL {
      `);
        return this;
    }
    callEnd() {
        this.query.raw(`
  }
      `);
        return this;
    }
    createEntitiesByParent(childEntity, parentEntity, properties, relationProperty) {
        const relationName = `${parentEntity}${childEntity}Relation`;
        const relationDefinition = `${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}`;
        properties.forEach((props, i) => {
            const nodeName = `${childEntity}${i}`;
            this.dependencies.add(nodeName);
            if (relationProperty) {
                this.query.merge([
                    (0, cypher_query_builder_1.node)(nodeName, childEntity, props),
                    (0, cypher_query_builder_1.relation)('in', relationName, relationDefinition, relationProperty),
                    (0, cypher_query_builder_1.node)(parentEntity),
                ]);
            }
            else {
                this.query.merge([
                    (0, cypher_query_builder_1.node)(nodeName, childEntity, props),
                    (0, cypher_query_builder_1.relation)('in', relationName, relationDefinition),
                    (0, cypher_query_builder_1.node)(parentEntity),
                ]);
            }
            this.query
                .setVariables(addCreateDateToProperties(nodeName))
                .with([...this.dependencies.values()].join(','));
            this.returns.push(nodeName);
        });
        return this;
    }
    createEntityByParent(childEntity, parentEntity, properties = {}, relationProperty) {
        this.dependencies.add(childEntity);
        const relationName = `${parentEntity}${childEntity}Relation`;
        const relationDefinition = `${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}`;
        if (relationProperty) {
            this.query.merge([
                (0, cypher_query_builder_1.node)(childEntity, childEntity, properties),
                (0, cypher_query_builder_1.relation)('in', relationName, relationDefinition, relationProperty),
                (0, cypher_query_builder_1.node)(parentEntity),
            ]);
        }
        else {
            this.query.create([
                (0, cypher_query_builder_1.node)(childEntity, childEntity, properties),
                (0, cypher_query_builder_1.relation)('in', relationName, relationDefinition),
                (0, cypher_query_builder_1.node)(parentEntity),
            ]);
        }
        this.query
            .setVariables(addCreateDateToProperties(childEntity))
            .with([...this.dependencies.values()].join(','));
        this.returns.push(childEntity);
        return this;
    }
    createInternalRelations(childEntity, parentEntity, ids) {
        if ((ids === null || ids === void 0 ? void 0 : ids.length) > 0) {
            this.dependencies.add(`${childEntity}List`);
            this.query.raw(` 
            OPTIONAL MATCH (${childEntity}List:${childEntity}) WHERE ID(${childEntity}List) in [${(0, exports.processEntityIds)(ids)}]
            MERGE (${parentEntity})-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}List)
            WITH ${[...this.dependencies.values()].join(',')}
        `);
            this.returns.push(`${childEntity}List`);
        }
        return this;
    }
    createExternalRelations(childEntity, parentEntity, ids) {
        if ((ids === null || ids === void 0 ? void 0 : ids.length) > 0) {
            this.dependencies.add(`${childEntity}List`);
            this.query.raw(`
            OPTIONAL MATCH (${childEntity}List:${childEntity}) WHERE ID(${childEntity}List) in [${(0, exports.processEntityIds)(ids)}]
            ${this.findWhereConditions(childEntity + 'List', parentEntity)}
            MERGE (${parentEntity})<-[${childEntity}${parentEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(${childEntity}List)
            WITH ${[...this.dependencies.values()].join(',')}
        `);
            this.returns.push(`${childEntity}List`);
        }
        return this;
    }
    createExternalRelation(childEntity, parentEntity, id) {
        if (id) {
            this.dependencies.add(`${childEntity}`);
            this.query.raw(`
            OPTIONAL MATCH (${childEntity}:${childEntity}) WHERE ID(${childEntity}) = ${id}
            ${this.findWhereConditions(childEntity, parentEntity)}
            MERGE (${parentEntity})<-[${childEntity}${parentEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(${childEntity})
            WITH ${[...this.dependencies.values()].join(',')}
        `);
            this.returns.push(`${childEntity}`);
        }
        return this;
    }
    createDescendantRelation(childEntity, parentEntity, id) {
        if (id) {
            this.dependencies.add(`${childEntity}`);
            this.query.raw(`
            OPTIONAL MATCH (${childEntity}:${childEntity}) WHERE ID(${childEntity}) = ${id}
            ${this.findWhereConditions(childEntity, parentEntity)}
            MERGE (${parentEntity})<-[${childEntity}${parentEntity}Relations:${childEntity.toUpperCase()}_DESCENDANT_${parentEntity.toUpperCase()}]-(${childEntity})
            WITH ${[...this.dependencies.values()].join(',')}
        `);
            this.returns.push(`${childEntity}`);
        }
        return this;
    }
    createMemberRelation(userId, treeId) {
        this.query = this.query.raw(`
    MATCH (User:User) WHERE ID(User) = ${userId}
    MATCH (Tree:Tree) WHERE ID(Tree) = ${treeId}

    MERGE (User)-[TreeUserRelations:TREE_MEMBER_USER]->(Tree)
    `);
        return this;
    }
    createMemberAndDescendantRelations(userId, toUserId, treeId) {
        this.query = this.query.raw(`
    MATCH (User1:User) WHERE ID(User1) = ${userId}
    MATCH (User2:User) WHERE ID(User2) = ${toUserId}
    MATCH (Tree:Tree) WHERE ID(Tree) = ${treeId}

    MERGE (User2)<-[UserUserRelations:USER_DESCENDANT_USER]-(User1)
    MERGE (User1)-[TreeUserRelations:TREE_MEMBER_USER]->(Tree)
    `);
        return this;
    }
    createMemberAndMarriedRelations(userId, toUserId, treeId) {
        this.query = this.query.raw(`
    MATCH (User1:User) WHERE ID(User1) = ${userId}
    MATCH (User2:User) WHERE ID(User2) = ${toUserId}
    MATCH (Tree:Tree) WHERE ID(Tree) = ${treeId}

    MERGE (User2)<-[UserUserRelations:USER_MARRIED_USER]-(User1)
    MERGE (User1)-[TreeUserRelations:TREE_MEMBER_USER]->(Tree)
    `);
        return this;
    }
    createEntity(entity, props, uuid = false) {
        this.dependencies.add(entity);
        if (uuid) {
            this.query = this.connection
                .createNode(entity, entity, props)
                .setVariables(addCreateDateToProperties(entity))
                .setVariables(addUuidToProperties(entity))
                .with([...this.dependencies.values()].join(','));
        }
        else {
            this.query = this.connection
                .createNode(entity, entity, props)
                .setVariables(addCreateDateToProperties(entity))
                .with([...this.dependencies.values()].join(','));
        }
        this.returns.push(entity);
        return this;
    }
    createNode(entity) {
        this.query = this.query.raw(`CREATE (${entity}:${entity})`);
        this.returns.push(entity);
        return this;
    }
    createResult(queryReturns) {
        return `{${queryReturns
            .map((queryReturn) => {
            return queryReturn.includes('List')
                ? `${queryReturn}:collect(distinct ${queryReturn})`
                : `${queryReturn}:${queryReturn}`;
        })
            .join(',')}} as data`;
    }
    async commit() {
        if (process.env.NODE_ENV === 'local') {
            console.log(this.query.interpolate(), '\n ------------END OF QUERY-----------');
        }
        return await this.query.run();
    }
    async commitWithReturnEntities() {
        this.query.return(this.createResult(this.returns));
        if (process.env.NODE_ENV === 'local') {
            console.log(this.query.interpolate(), '\n ------------END OF QUERY-----------');
        }
        return await this.query.run();
    }
    async commitWithReturnEntity() {
        this.query.return(this.createResult(this.returns));
        if (process.env.NODE_ENV === 'local') {
            console.log(this.query.interpolate(), '\n ------------END OF QUERY-----------');
        }
        return await this.query.first();
    }
    async commitWithReturnCount() {
        this.query.return('count(*) as count');
        if (process.env.NODE_ENV === 'local') {
            console.log(this.query.interpolate(), '\n ------------END OF QUERY-----------');
        }
        return await this.query.first();
    }
    convertEntityByParent(fromEntity, toEntity, parentEntity, properties = {}) {
        const [parentEntityName, parentEntityLabel, parentEntityId] = parentEntity;
        this.dependencies.add(toEntity);
        this.dependencies.add(parentEntityName);
        this.query
            .create([
            (0, cypher_query_builder_1.node)(toEntity, toEntity, properties),
            (0, cypher_query_builder_1.relation)('in', ``, `${toEntity.toUpperCase()}_CONVERTED_FROM_${fromEntity.toUpperCase()}`),
            (0, cypher_query_builder_1.node)(fromEntity),
        ])
            .setVariables(addCreateDateToProperties(toEntity))
            .raw(`
          WITH *
          MATCH (${parentEntityName}:${parentEntityLabel})
          WHERE ID(${parentEntityName}) = ${parentEntityId}
          WITH *
      `)
            .create([
            (0, cypher_query_builder_1.node)(toEntity),
            (0, cypher_query_builder_1.relation)('in', `${parentEntityLabel.toUpperCase()}${toEntity.toUpperCase()}Relation`, `${parentEntityLabel.toUpperCase()}_INCLUDES_${toEntity.toUpperCase()}`),
            (0, cypher_query_builder_1.node)(parentEntityName),
        ])
            .with([...this.dependencies.values()].join(','));
        this.returns.push(toEntity, parentEntityName);
        return this;
    }
    countSearchResultsByParentUsingContains(childEntity, parentEntity, params, query, findArchived = false) {
        const whereOverrideList = ['Note'];
        if (whereOverrideList.includes(childEntity)) {
            var joinOperator = findArchived ? 'AND' : 'WHERE';
        }
        else {
            var joinOperator = findArchived ? 'WHERE' : 'AND';
        }
        const result = this.customWith(`*, ${parentEntity}List as ${parentEntity}`)
            .removeDependencies([`${parentEntity}List`])
            .findEntitiesByParent(childEntity, parentEntity, findArchived)
            .whereCombined(params.map((p, idx) => {
            const searchQuery = `${childEntity}.${p} CONTAINS("${query}")`;
            if (idx == params.length - 1) {
                return {
                    query: searchQuery,
                };
            }
            return {
                query: searchQuery,
                joinOperator: 'OR',
            };
        }), joinOperator)
            .withFirstDistinct([childEntity])
            .raw(`WITH count(${childEntity}) as rowsCount`);
        this.returns = ['rowsCount'];
        return result;
    }
    countSearchResultsByParentUsingIndex(childEntity, parentEntity, indexName, query) {
        const searchQuery = query
            .split(' ')
            .map((subQuery) => `*${subQuery}*`)
            .join(' OR ');
        this.query.raw(`CALL db.index.fulltext.queryNodes("${indexName}", "${searchQuery}") 
      YIELD node as ${childEntity}
      WHERE (
        EXISTS ((${parentEntity}List)-[:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})) 
        AND ((NOT(${childEntity}.isDeleted) = true OR NOT exists(${childEntity}.isDeleted)))
      )
      WITH count(${childEntity}) as rowsCount
    `);
        this.returns = ['rowsCount'];
        return this;
    }
    customReturn(query) {
        this.query.raw(`RETURN
  ${query}      
      `);
        return this;
    }
    customWith(query) {
        this.query.raw(`WITH
  ${query}      
      `);
        return this;
    }
    deleteEntity(entity) {
        this.query.raw(`DELETE ${entity}`);
        return this;
    }
    deleteEntityByParent(childEntity, parentEntity, id) {
        if (id > -1) {
            this.query.raw(` 
              MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
              WHERE ID(${childEntity}) = ${id}
              DETACH DELETE ${childEntity}
            `);
        }
        return this;
    }
    deleteEntityById(parentEntity, id) {
        this.query.raw(` 
            MATCH (${parentEntity})
            WHERE ID(${parentEntity}) = ${id}
            DETACH DELETE ${parentEntity}
          `);
        return this;
    }
    deleteEntitiesByParents(childEntity, parentEntity) {
        this.query.raw(` 
          MATCH (${parentEntity}List)-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}List:${childEntity})
          DETACH DELETE ${childEntity}List
          WITH *
        `);
        return this;
    }
    deleteEntities(entity) {
        this.query.raw(`
          DETACH DELETE ${entity}List
          WITH *
        `);
        return this;
    }
    deleteRelationsByName(relationName) {
        this.query.raw(`DELETE ${relationName}`);
        return this;
    }
    findEntityByChild(childEntity, parentEntity) {
        this.query.raw(`MATCH (${parentEntity}:${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})
      `);
        return this;
    }
    findEntitiesByChild(childEntity, parentEntity) {
        this.query.raw(`MATCH (${parentEntity}List)-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
      `);
        return this;
    }
    findEntitiesByChildLabel(childEntity, parentEntity) {
        this.query.raw(`MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})
      `);
        return this;
    }
    findEntitiesByChildId(childEntity, parentEntity, childId, willReturn = false) {
        this.query.raw(` MATCH (${parentEntity}List)-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})

        WHERE id(${childEntity})=${childId}
      `);
        if (willReturn) {
            this.returns.push(childEntity);
        }
        return this;
    }
    findEntityById(entity, id) {
        this.query.raw(`MATCH (${entity}:${entity})
    WHERE ID(${entity}) = ${id}  
    WITH *               
    `);
        this.returns.push(entity);
        return this;
    }
    findEntityByIdWithoutName(id) {
        this.query.raw(`MATCH (n)
    WHERE ID(n) = ${id}  
    WITH *               
    `);
        this.returns.push('n');
        return this;
    }
    findEntityByIds(entity, ids) {
        this.query.raw(`MATCH (${entity}:${entity})
    WHERE ID(${entity}) IN [${ids}]  
    WITH *             
    `);
        this.returns.push(entity);
        return this;
    }
    findEntityByParent(childEntity, parentEntity, id, willReturn = false) {
        if (!id) {
            this.query.raw(` 
        WITH *  
        OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(Add${childEntity}:${childEntity})         
        `);
        }
        else if (id > -1) {
            this.query.raw(`MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
        WHERE ID(${childEntity}) = ${id}           
        `);
            if (willReturn) {
                this.returns.push(childEntity);
            }
        }
        return this;
    }
    findEntitiesByParentByProperty(childEntity, parentEntity, propertyName, propertyValue) {
        this.findEntitiesByParent(childEntity, parentEntity).query.raw(`AND ${convert(`${childEntity}.${propertyName}`, propertyValue)}`);
        return this;
    }
    findEntitiesByParent(childEntity, parentEntity, fetchArchived = false) {
        this.query.raw(`MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
       ${this.findWhereConditions(childEntity, parentEntity, true, fetchArchived)}
          `);
        this.returns.push(childEntity);
        return this;
    }
    findEntitiesByParentByIds(childEntity, parentEntity, ids, attachArchived = false) {
        this.query.raw(`
        MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
        WHERE id(${childEntity}) IN [${ids}]
        ${attachArchived
            ? ''
            : this.findWhereArchivedConditions(childEntity + 'List', parentEntity, true)}
          `);
        this.returns.push(childEntity);
        return this;
    }
    findEntitiesByParents(childEntity, parentEntity, fetchArchived = false) {
        this.query.raw(` MATCH (${parentEntity}List)-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
       ${this.findWhereConditions(childEntity, `${parentEntity}List`, true, fetchArchived)}
          `);
        this.returns.push(childEntity);
        return this;
    }
    findEntitiesByParentIfAny(childEntity, parentEntity) {
        this.query.raw(`OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})`);
        return this;
    }
    findEntitiesByStatusAndDate(childEntity, parentEntity, childEntityStatus, completeDate) {
        this.query.raw(` MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
         WHERE ${childEntity}.status = '${childEntityStatus}'
         AND datetime(${childEntity}.completeDate).year = ${completeDate.year}
         AND datetime(${childEntity}.completeDate).month = ${completeDate.month}
          `);
        this.returns.push(childEntity);
        return this;
    }
    findEntitiesByStatus(childEntity, parentEntity, childEntityStatus) {
        this.query.raw(` MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
         WHERE ${childEntity}.status = '${childEntityStatus}'
          `);
        this.returns.push(childEntity);
        return this;
    }
    findWhereConditions(childEntity, parentEntity, where, findArchived = false) {
        const arr = ['Note', 'Workspace', 'WorkspaceList', 'Tag', 'TagList'];
        const whereStmt = where ? 'WHERE' : 'AND';
        if (arr.includes(childEntity)) {
            return `${whereStmt} (NOT(${childEntity}.isDeleted) = true
     OR ${childEntity}.isDeleted IS NULL)
    ${findArchived
                ? ''
                : this.findWhereArchivedConditions(childEntity, parentEntity)} 
     `;
        }
        else {
            return `${findArchived
                ? ''
                : this.findWhereArchivedConditions(childEntity, parentEntity, where)}`;
        }
    }
    findWhereParentNotArchived(parentEntity) {
        this.query.raw(`${this.findWhereArchivedConditions(parentEntity, null, true)}`);
        return this;
    }
    findWhereArchivedConditions(childEntity, parentEntity, where) {
        const arr = [
            'Note',
            'NoteList',
            'Outcome',
            'OutcomeList',
            'Action',
            'ActionList',
            'OutcomeActionList',
        ];
        let query = `${childEntity}.isArchived = false`;
        if (where) {
            query = `WHERE ` + query;
            return arr.includes(childEntity) ? query : '';
        }
        else {
            query = `AND ` + query;
            return arr.includes(childEntity) ? query : '';
        }
    }
    findUserByEmail(email) {
        this.dependencies.add('User');
        this.query = this.connection
            .match([
            (0, cypher_query_builder_1.node)('User', 'User', {
                email,
            }),
        ])
            .with([...this.dependencies.values()].join(','));
        this.returns.push('User');
        return this;
    }
    findUsersByEmails(emails) {
        this.dependencies.add('User');
        this.query.raw(`
      MATCH (UserList:User) 
      WHERE UserList.email IN [${emails.map((e) => JSON.stringify(e))}]
    `);
        this.returns.push('User');
        return this;
    }
    groupChildIntoParentAndReturn(childEntity, parentEntity, willReturn = true) {
        if (willReturn) {
            this.query.raw(`RETURN`);
        }
        this.query.raw(`${parentEntity}{.*, id: id(${parentEntity}), ${childEntity}: COLLECT(DISTINCT ${childEntity}{.* ,id: id(${childEntity})})}`);
        if (willReturn) {
            this.query.raw(`as data`);
        }
        return this;
    }
    markDeletedEntityByParent(childEntity, parentEntity, id) {
        this.dependencies.add(childEntity);
        this.query.raw(` MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]-(${childEntity}:${childEntity})
        WHERE ID(${childEntity}) = ${id}
        SET ${childEntity}.isDeleted = true
        SET ${parentEntity}${childEntity}Relation.isDeleted = true
        WITH *
          `);
        return this;
    }
    mergeAndSetValuesOnRelation(childEntity, parentEntity, toSetProperties) {
        this.query.raw(`MERGE (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})`);
        if (toSetProperties === null || toSetProperties === void 0 ? void 0 : toSetProperties.length) {
            this.query.raw(`SET ${toSetProperties
                .map(({ value, property, cypher }) => {
                if (typeof value === 'string') {
                    value = `'${value}'`;
                }
                if (Object.is(value, null)) {
                    value = cypher;
                }
                return `${parentEntity}${childEntity}Relation.${property} = ${value}`;
            })
                .join(', ')}`);
        }
        this.returns.push(`${parentEntity}${childEntity}Relation`);
        return this;
    }
    raw(query) {
        this.query.raw(query);
        return this;
    }
    resetClass() {
        this.returns = [];
        this.dependencies = new Set();
    }
    removeDependencies(deps) {
        deps.forEach((d) => {
            this.dependencies.delete(`${d}`);
            this.returns = this.returns.filter((val) => val !== d);
        });
        return this;
    }
    resolveEntityOrDefaultByParent(childEntity, parentEntity, id, customWith) {
        if (id > -1) {
            this.dependencies.add(childEntity);
            this.findEntityByParent(childEntity, parentEntity, id, true);
            if (customWith === null || customWith === void 0 ? void 0 : customWith.length) {
                this.query.raw(`WITH ${customWith.join(', ')}`);
            }
            else {
                this.query.with([...this.dependencies.values()].join(','));
            }
        }
        else {
            this.resolveDefaultEntityByParent(childEntity, parentEntity);
        }
        return this;
    }
    resolveEntitiesByParent(childEntity, parentEntity, withClause = true) {
        this.dependencies.add(`${childEntity}List`);
        this.query.raw(`WITH * OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}List:${childEntity})
       ${this.findWhereConditions(`${childEntity}List`, parentEntity, true)}
          `);
        if (withClause) {
            this.query.with([...this.dependencies.values()].join(','));
        }
        this.returns.push(`${childEntity}List`);
        return this;
    }
    resolveEntitiesByParentWhereRelationExists(childEntity, parentEntity, relation, attachArchived = true, includeWith = true) {
        const [relationChildEntity, relationParentEntity] = relation;
        this.dependencies.add(`${childEntity}List`);
        let query = `OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}List:${childEntity})`;
        if (attachArchived) {
            query += `
      WHERE 
        EXISTS(
        (${relationParentEntity}List)-[:${relationParentEntity.toUpperCase()}_INCLUDES_${relationChildEntity.toUpperCase()}]->(${relationChildEntity}List)
      )`;
        }
        else {
            query += `
      WHERE ((${childEntity}List.isArchived) = false
        OR NOT exists(${childEntity}List.isArchived))
          AND 
          EXISTS(
          (${relationParentEntity}List)-[:${relationParentEntity.toUpperCase()}_INCLUDES_${relationChildEntity.toUpperCase()}]->(${relationChildEntity}List)
      )`;
        }
        this.query.raw(query);
        includeWith && this.query.with([...this.dependencies.values()].join(','));
        return this;
    }
    resolveDefaultEntityByParent(childEntity, parentEntity) {
        this.dependencies.add(childEntity);
        this.query
            .match([
            (0, cypher_query_builder_1.node)(childEntity, childEntity, { name: 'General' }),
            (0, cypher_query_builder_1.relation)('in', '', `${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}`),
            (0, cypher_query_builder_1.node)(parentEntity),
        ])
            .with([...this.dependencies.values()].join(','));
        this.returns.push(childEntity);
        return this;
    }
    resolveDefaultEntityByName(childEntity, parentEntity, nameEntity) {
        this.dependencies.add(childEntity);
        this.query
            .match([
            (0, cypher_query_builder_1.node)(childEntity, childEntity, { name: nameEntity }),
            (0, cypher_query_builder_1.relation)('in', `${parentEntity}${childEntity}Relation`, `${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}`),
            (0, cypher_query_builder_1.node)(parentEntity),
        ])
            .with([...this.dependencies.values()].join(','));
        this.returns.push(childEntity);
        return this;
    }
    resolveEntitiesByIds(entity, ids, willReturn = false, customWith, includeWith = true) {
        this.dependencies.add(`${entity}List`);
        this.query.raw(`
      OPTIONAL MATCH (${entity}List:${entity}) 
      WHERE id(${entity}List) IN [${ids}]
    `);
        if (includeWith) {
            if (customWith.length) {
                this.query.raw(`WITH ${customWith.join(', ')}`);
            }
            else {
                this.query.with([...this.dependencies.values()].join(','));
            }
        }
        if (willReturn)
            this.returns.push(`${entity}List`);
        return this;
    }
    searchEntitiesByParentUsingContains(childEntity, parentEntity, params, query, findArchived = false) {
        const whereOverrideList = ['Note'];
        if (whereOverrideList.includes(childEntity)) {
            var joinOperator = findArchived ? 'AND' : 'WHERE';
        }
        else {
            var joinOperator = findArchived ? 'WHERE' : 'AND';
        }
        query = query.replace(/&#92;/g, '\\');
        query = JSON.stringify(query.replace(/\"/gi, `\"`));
        this.findEntitiesByParents(childEntity, parentEntity, findArchived)
            .whereCombined(params.map((p, idx) => {
            const searchQuery = `${childEntity}.${p} CONTAINS(${query})`;
            if (idx == params.length - 1) {
                return {
                    query: searchQuery,
                };
            }
            return {
                query: searchQuery,
                joinOperator: 'OR',
            };
        }), joinOperator)
            .removeDependencies([childEntity, 'UserWorkspaceRelation'])
            .withFirstDistinct([childEntity, ...this.dependencies.values()])
            .addDependencies([childEntity], true);
        return this;
    }
    searchEntitiesByParentUsingIndex(childEntity, parentEntity, indexName, query, offset, limit) {
        return this.searchByParent(childEntity, parentEntity, parentEntity, indexName, query, offset, limit);
    }
    searchEntitiesByParentsUsingIndex(childEntity, parentEntity, indexName, query, offset, limit) {
        return this.searchByParent(childEntity, parentEntity, `${parentEntity}List`, indexName, query, offset, limit);
    }
    searchByParent(childEntity, parentEntity, parentEntityName, indexName, query, offset = 0, limit = 1000) {
        const searchQuery = query
            .split(' ')
            .map((subQuery) => `*${subQuery}*`)
            .join(' OR ');
        const skip = offset * limit;
        this.query.raw(`CALL db.index.fulltext.queryNodes("${indexName}", "${searchQuery}") 
      YIELD node as ${childEntity}
      WHERE (
        EXISTS ((${parentEntityName})-[:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})) 
        AND ((NOT(${childEntity}.isDeleted) = true OR ${childEntity}.isDeleted IS NULL))
      )
      WITH *, ${childEntity} SKIP ${skip} LIMIT ${limit}
    `);
        this.returns.push(childEntity);
        return this;
    }
    searchInvitedUserEntities(childEntity, indexName, query, offset = 0, limit = 1000) {
        const searchQuery = query
            .split(' ')
            .map((subQuery) => `*${subQuery}*`)
            .join(' OR ');
        const skip = offset * limit;
        this.query.raw(`CALL db.index.fulltext.queryNodes("${indexName}", "${searchQuery}") 
      YIELD node as ${childEntity}
      WHERE ID(User) IN RootUser.invitedUsersIds
      WITH *, ${childEntity} SKIP ${skip} LIMIT ${limit}
    `);
        this.returns.push(childEntity);
        return this;
    }
    setPropertyOnEntity(entity, toSetProperties = {}) {
        toSetProperties = addUpdateDateToProperties(undefined, toSetProperties);
        this.query.raw(`SET ${Object.entries(toSetProperties)
            .map(([property, value]) => {
            if (typeof value === 'string' && !value.match('apoc')) {
                value = `'${value}'`;
            }
            if (Array.isArray(value)) {
                value = `[${value}]`;
            }
            return `${entity}.${property} = ${value}`;
        })
            .join(', ')}`);
        return this;
    }
    union(all = false) {
        if (all) {
            this.query.raw(`
      UNION ALL`);
        }
        else {
            this.query.raw(`
      UNION`);
        }
        return this;
    }
    unwindEntities(entityList, toEntity) {
        this.query.raw(`UNWIND ${entityList}List as ${toEntity}`);
        return this;
    }
    updateEntity(childEntity, properties = {}) {
        if (Object.keys(properties).length) {
            this.query
                .setValues(properties)
                .setVariables(addUpdateDateToProperties(childEntity))
                .with([...this.dependencies.values()].join(','));
        }
        this.returns.push(childEntity);
        return this;
    }
    updateEntityList(childEntity, properties = {}) {
        if (Object.keys(properties).length) {
            this.query
                .setValues(properties)
                .setVariables(addUpdateDateToProperties(`${childEntity}List`))
                .with([...this.dependencies.values()].join(','));
        }
        this.returns.push(`${childEntity}List`);
        return this;
    }
    updateEntityByParent(childEntity, parentEntity, properties = {}, id) {
        this.dependencies.add(childEntity);
        this.query
            .match([
            (0, cypher_query_builder_1.node)(childEntity, childEntity),
            (0, cypher_query_builder_1.relation)('in', `${parentEntity}${childEntity}Relation`, `${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}`),
            (0, cypher_query_builder_1.node)(parentEntity),
        ])
            .raw(`WHERE ID(${childEntity}) = ${id}`)
            .setValues(properties)
            .setVariables(addUpdateDateToProperties(childEntity))
            .with([...this.dependencies.values()].join(','));
        this.returns.push(childEntity);
        return this;
    }
    updateOutcomeAllActionsDoneOnActionChange(toAddDependencies = []) {
        toAddDependencies.forEach((dep) => {
            this.dependencies.add(dep);
        });
        const query = `
    WITH ${[...this.dependencies.values()].join(',') +
            ', COLLECT(DISTINCT AddAction) as AllActions'}
    WITH *, [Act in AllActions WHERE Act.isArchived = false] as ActionListCollected
    WITH *, ALL(Act in ActionListCollected WHERE Act.status = 'DONE') as IsAllActionsDone, size(ActionListCollected) as ActionsCount     
    SET Outcome.isAllActionsDone = 
      CASE Outcome.status 
        WHEN "COMPLETED"
        THEN 
            CASE (Outcome._previousIsAllActionsDone = true OR Outcome._previousIsAllActionsDone IS NULL)
            WHEN true
                THEN CASE 
                  WHEN Action.status = 'DONE' 
                      THEN null
                      ELSE false
                      END                               
                ELSE null
            END    
      ELSE 
          CASE Outcome.isAllActionsDone
                WHEN true 
                  THEN 
                      CASE IsAllActionsDone
                          WHEN false 
                              THEN null
                              ELSE null
                              END         
                  ELSE 
                  CASE IsAllActionsDone
                          WHEN true 
                              THEN CASE ActionsCount = 0
                                    WHEN true
                                        THEN null
                                        ELSE true
                                        END
                              ELSE null
                              END
            END            
        END
      SET Outcome._previousIsAllActionsDone = 
        CASE ActionsCount = 0
          WHEN true
           THEN null
           ELSE IsAllActionsDone
        END   
      WITH * 
  `;
        this.query.raw(query);
        return this;
    }
    updateOutcomeAllActionsDoneOnOutcomeChange(actionIds, tagIds) {
        let query = ``;
        if (!(actionIds === null || actionIds === void 0 ? void 0 : actionIds.length)) {
            query = `SET Outcome.isAllActionsDone = null
      SET Outcome._previousIsAllActionsDone = null  
      WITH *
      `;
        }
        else {
            let toAddDependencies = ['User', 'Workspace', 'Outcome'];
            if (tagIds === null || tagIds === void 0 ? void 0 : tagIds.length) {
                toAddDependencies = [...toAddDependencies, 'TagList'];
            }
            else {
                this.removeDependencies(['TagList']);
            }
            this.addDependencies(toAddDependencies);
            this.dependencies.delete('ActionList');
            query += `
        WITH ${[...this.dependencies.values()].join(', ')}, ActionList as AllActionList
        WITH COLLECT(DISTINCT AllActionList) as ActionList, ${[
                ...this.dependencies.values(),
            ].join(', ')}
        WITH *, all(Act in ActionList WHERE Act.status = 'DONE' ) as IsAllActionsDone, all(Act in ActionList WHERE Act.isArchived = false AND Act.status = 'DONE') as IsWithoutArchived
        
        SET Outcome.isAllActionsDone = 
        CASE size(ActionList) > 0
            WHEN true
            THEN
                CASE Outcome.status 
                  WHEN "COMPLETED"
                          THEN CASE ((Outcome._previousIsAllActionsDone = true OR Outcome._previousIsAllActionsDone IS NULL) AND IsWithoutArchived = false)
                                  WHEN true
                                    THEN false
                                    ELSE null
                               END
                          ELSE CASE ((Outcome._previousIsAllActionsDone = false OR Outcome._previousIsAllActionsDone IS NULL) AND IsWithoutArchived = true)
                                  WHEN true
                                    THEN true
                                    ELSE null
                               END
                END
            ELSE  CASE Outcome.status 
                    WHEN "COMPLETED" 
                    THEN Outcome.isAllActionsDone = false
                    ELSE Outcome.isAllActionsDone = null
                  END 
        END
      WITH *  

      SET Outcome._previousIsAllActionsDone = 
        CASE size(ActionList) > 0
            WHEN true
            THEN IsWithoutArchived  
            ELSE false
        END  

      WITH *

      `;
        }
        this.query.raw(query);
        return this;
    }
    whereCombined(params, startOperator = 'WHERE') {
        this.query.raw(`${startOperator} (`);
        params.forEach(({ query, joinOperator }) => {
            this.query.raw(`${query} `);
            if (joinOperator) {
                this.query.raw(`${joinOperator} `);
            }
            else {
                this.query.raw(`)`);
            }
        });
        return this;
    }
    wherePropertyValue(entity, param, values, addNOTcondition = false, startOperator = 'WHERE') {
        let operator = '=';
        if (Array.isArray(values)) {
            operator = 'IN';
            values = `[${values.map((e) => (typeof e === 'string' ? `'${e}'` : e))}]`;
        }
        else {
            values = typeof values === 'string' ? `'${values}'` : values;
        }
        if (param.toLowerCase() === 'id') {
            var property = `ID(${entity})`;
        }
        else {
            var property = `${entity}.${param}`;
        }
        const searchQuery = `${property} ${operator} ${values}`;
        if (addNOTcondition) {
            this.query.raw(`${startOperator} NOT (${searchQuery})`);
        }
        else {
            this.query.raw(`${startOperator} ${searchQuery}`);
        }
        return this;
    }
    withFirstDistinct(dependencies = []) {
        if (dependencies === null || dependencies === void 0 ? void 0 : dependencies.length) {
            this.query.raw(`WITH DISTINCT ${dependencies.join(', ')}`);
        }
        else {
            this.query.raw(`WITH DISTINCT ${[...this.dependencies.values()].reverse().join(',')}`);
        }
        return this;
    }
}
exports.RepositoryQuery = RepositoryQuery;
function addCreateDateToProperties(entity, properties = {}) {
    const timestamp = Date.now();
    if (entity) {
        properties = Object.assign(Object.assign({}, properties), { [`${entity}.createDate`]: `${timestamp}` });
    }
    else {
        properties = Object.assign(Object.assign({}, properties), { createDate: `${timestamp}` });
    }
    return properties;
}
exports.addCreateDateToProperties = addCreateDateToProperties;
function addUuidToProperties(entity, properties = {}) {
    let newUuid = (0, uuid_1.v4)();
    if (entity) {
        properties = Object.assign(Object.assign({}, properties), { [`${entity}.uuid`]: `'${newUuid}'` });
    }
    else {
        properties = Object.assign(Object.assign({}, properties), { uuid: `'${newUuid}'` });
    }
    return properties;
}
exports.addUuidToProperties = addUuidToProperties;
function addUpdateDateToProperties(entity, properties = {}) {
    const timestamp = Date.now();
    if (entity) {
        properties = Object.assign(Object.assign({}, properties), { [`${entity}.updateDate`]: `${timestamp}` });
    }
    else {
        properties = Object.assign(Object.assign({}, properties), { updateDate: `${timestamp}` });
    }
    return properties;
}
exports.addUpdateDateToProperties = addUpdateDateToProperties;
const processEmptyNestedArray = (arr) => {
    if ((arr === null || arr === void 0 ? void 0 : arr.length) < 1) {
        return [];
    }
    return arr === null || arr === void 0 ? void 0 : arr.filter((x) => {
        if (Array.isArray(x)) {
            return x.length > 0;
        }
        return true;
    });
};
exports.processEmptyNestedArray = processEmptyNestedArray;
const processEntityIds = (array) => {
    if (array) {
        return array
            .map((o) => {
            return o;
        })
            .join(',');
    }
    else {
        return '-1';
    }
};
exports.processEntityIds = processEntityIds;
const processArrayProperty = (array) => {
    if ((array === null || array === void 0 ? void 0 : array.length) > 0) {
        return array.map((o) => {
            return (0, exports.mapCypherResultToEntity)(o);
        });
    }
    else {
        return [];
    }
};
exports.processArrayProperty = processArrayProperty;
const buildTree = (data) => {
    let descendant = this.getDescendantRel(data.rList);
    let married = this.getMarriedRel(data.rList);
    let rootUser = this.getRootUser(data.nList, descendant, married);
    let tree = this.buildTreeFromRelations(rootUser, data.nList, descendant, married);
    return tree;
};
exports.buildTree = buildTree;
const getDescendantRel = (data) => {
    let result = [];
    for (let rel of data) {
        for (let item of rel) {
            if (item.label === 'USER_DESCENDANT_USER') {
                result.push(item);
            }
        }
    }
    let res = this.removeDuplicates(result, "identity");
    return res;
};
exports.getDescendantRel = getDescendantRel;
const getMarriedRel = (data) => {
    let result = [];
    for (let rel of data) {
        for (let item of rel) {
            if (item.label === "USER_MARRIED_USER") {
                result.push(item);
            }
        }
    }
    let res = this.removeDuplicates(result, "identity");
    return res;
};
exports.getMarriedRel = getMarriedRel;
const removeDuplicates = (originalArray, prop) => {
    var newArray = [];
    var lookupObject = {};
    for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
    }
    for (i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
    return newArray;
};
exports.removeDuplicates = removeDuplicates;
const getRootUser = (members, descendantRels, marriedRel) => {
    const resultWithoutDescendantRels = members.filter(e => !descendantRels.find(a => e.identity == a.start));
    const resultWithoutMarriedRel = resultWithoutDescendantRels.filter(e => !marriedRel.find(a => e.identity == a.start));
    const rootUser = resultWithoutMarriedRel.filter(object => {
        return object.labels[0] !== 'Tree';
    });
    return rootUser;
};
exports.getRootUser = getRootUser;
const buildTreeFromRelations = (rootUser, members, descendantRels, marriedRel) => {
    descendantRels = descendantRels.filter(object => {
        return object.end !== object.start;
    });
    descendantRels.push({
        identity: 'ROOT',
        start: rootUser[0].identity,
        end: 'ROOT',
        label: 'USER_DESCENDANT_USER',
        properties: {}
    });
    members = members.filter(object => {
        return object.labels[0] !== 'Tree';
    });
    const partial = (descendantRels = [], condition) => {
        const result = [];
        for (let i = 0; i < descendantRels.length; i++) {
            if (condition(descendantRels[i])) {
                result.push(descendantRels[i]);
            }
        }
        return result;
    };
    const findNodes = (parentKey, items, members) => {
        let subItems = partial(items, n => {
            return n.end == parentKey;
        });
        const result = [];
        for (let i = 0; i < subItems.length; i++) {
            let subItem = subItems[i];
            let resultItem = members.filter(obj => {
                return obj.identity == subItem.start;
            });
            let married = findNodes(subItem.start, marriedRel, members);
            if (married.length) {
                resultItem.push(Object.assign({ married: married }, resultItem));
            }
            let descendants = findNodes(subItem.start, items, members);
            if (descendants.length) {
                resultItem.push(Object.assign({ descendant: descendants }, resultItem));
            }
            result.push(resultItem);
        }
        return result;
    };
    let treeResult = findNodes('ROOT', descendantRels, members);
    return treeResult;
};
exports.buildTreeFromRelations = buildTreeFromRelations;
const Return = (array, ...args) => {
    return [...array, ...args.filter((a) => a)];
};
exports.Return = Return;
const mapCypherResultToEntity = (input, expand = {}) => {
    return !!input
        ? Object.assign(Object.assign({ id: input.identity }, input.properties), expand) : null;
};
exports.mapCypherResultToEntity = mapCypherResultToEntity;
//# sourceMappingURL=repository.utils.js.map