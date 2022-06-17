/* eslint-disable no-var */
import { Connection, node, Query, relation } from 'cypher-query-builder';
import {v4 as uuidv4} from 'uuid';

const convert = (propertyName: string, propertyValue: any) => {
  if (Array.isArray(propertyValue)) {
    return `${propertyName} IN [${propertyValue.map((value) =>
      typeof value === 'string' ? `"${value}"` : value,
    )}]`;
  } else {
    return `${propertyName} = ${propertyValue}`;
  }
};

export class RepositoryQuery {
  private query: Query;
  private dependencies: Set<string> = new Set<string>();
  private returns: string[] = [];
  constructor(private connection: Connection) {
    this.query = connection.query();
  }

  public addDependencies(deps: string[], willReturn = false): RepositoryQuery {
    deps.forEach((d) => {
      this.dependencies.add(`${d}`);
      if (willReturn) {
        this.returns.push(`${d}`);
      }
    });
    return this;
  }

  public beginWithUser(id: string): RepositoryQuery {
    this.dependencies.add('User');
    this.query = this.connection
    .match([
      node('User', 'User', {
        id: id,
      }),
    ])
    .with([...this.dependencies.values()].join(','));

    this.returns.push('User');
    return this;
  }
  
  public attachExternalEntitiesByParent(
    childEntity: string,
    parentEntity: string,
    attachArchived = false,
  ): RepositoryQuery {
    this.query.raw(
      ` 
        WITH *
        OPTIONAL MATCH (${parentEntity})<-[${childEntity}${parentEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(${childEntity}List:${childEntity})
        ${
          !attachArchived
            ? this.findWhereArchivedConditions(
                childEntity + 'List',
                parentEntity,
                true,
              )
            : ''
        }`,
    );
    this.returns.push(`${childEntity}List`);
    return this;
  }

  public fetchAllByEntityId(
    entityId: number,
    entity: string,
  ): RepositoryQuery {
    this.query.raw(
      `MATCH (${entity}:${entity}) WHERE ID(${entity}) = ${entityId}
       MATCH (${entity})-[rList*..10]-(nList)`,
    );
    this.returns.push(`${entity}`, 'rList', 'nList');
    return this;
  }

  public fetchDescendantTreeByUserId(
    userId: number,
  ): RepositoryQuery {
    this.query.raw(
      `MATCH (User:User) WHERE ID(User) = ${userId}
       MATCH (User)-[rList:USER_DESCENDANT_USER*..10]-(nList)`,
    );
    this.returns.push(`User`, 'rList', 'nList');
    return this;
  }

  public fetchUserByUserId(
    userId: number,
  ): RepositoryQuery {
    this.query.raw(
      `MATCH (User:User) WHERE ID(User) = ${userId}`);
    this.returns.push(`User`);
    return this;
  }

  public attachExternalEntityByParent(
    childEntity: string,
    parentEntity: string,
    attachArchived = false,
  ): RepositoryQuery {
    this.query.raw(
      ` 
        WITH *
        OPTIONAL MATCH (${parentEntity})<-[${childEntity}${parentEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(${childEntity}:${childEntity})
        ${
          !attachArchived
            ? this.findWhereArchivedConditions(childEntity, parentEntity, true)
            : ''
        }`,
    );
    this.returns.push(`${childEntity}`);
    return this;
  }

  public attachExternalEntityByParentList(
    childEntity: string,
    parentEntity: string,
  ): RepositoryQuery {
    this.dependencies.add(childEntity);
    this.query.raw(
      ` 
        WITH *
        OPTIONAL MATCH (${parentEntity}List)<-[${childEntity}${parentEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(${childEntity}:${childEntity})
        ${this.findWhereArchivedConditions(childEntity, parentEntity, true)}`,
    );
    this.returns.push(`${childEntity}`);
    return this;
  }

  public attachInternalEntitiesByParent(
    childEntity: string,
    parentEntity: string,
    attachArchived = false,
  ): RepositoryQuery {
    this.dependencies.add(`${childEntity}List`);
    this.query.raw(
      ` 
        WITH *
        OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}List:${childEntity})
        ${
          attachArchived
            ? ''
            : this.findWhereArchivedConditions(
                childEntity + 'List',
                parentEntity,
                true,
              )
        }`,
    );
    this.returns.push(`${childEntity}List`);
    return this;
  }

  public attachInternalEntityParentListByChildLabel(
    childEntity: string,
    parentEntity: string,
    attachArchived = false,
  ): RepositoryQuery {
    this.dependencies.add(`${childEntity}`);
    this.query.raw(
      ` 
        WITH *
        OPTIONAL MATCH (${parentEntity}List:${parentEntity})-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})
        ${
          !attachArchived
            ? this.findWhereArchivedConditions(childEntity, parentEntity, true)
            : ''
        }`,
    );
    this.returns.push(`${childEntity}`);
    return this;
  }

  public beginWithUserById(id: number): RepositoryQuery {
    this.dependencies.add('User');
    this.query = this.connection
    .match([
      node('User', 'User', {
        id: id,
      }),
    ])
    .with([...this.dependencies.values()].join(','));

    this.returns.push('User');
    return this;
  }
  
  public attachInternalEntityByParent(
    childEntity: string,
    parentEntity: string,
    attachArchived = false,
  ): RepositoryQuery {
    this.dependencies.add(`${childEntity}`);
    this.query.raw(
      ` 
        WITH *
        OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
        ${
          !attachArchived
            ? this.findWhereArchivedConditions(childEntity, parentEntity, true)
            : ''
        }`,
    );
    this.returns.push(`${childEntity}`);
    return this;
  }

  public attachInternalEntitiesByParentList(
    childEntity: string,
    parentEntity: string,
    deps: string[] = ['*'],
    alias?: string,
  ): RepositoryQuery {
    this.dependencies.add((alias || childEntity) + 'List');
    this.query.raw(
      ` 
        WITH ${deps.join(',')}
        OPTIONAL MATCH (${parentEntity}List)-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${
        alias || childEntity
      }List:${childEntity})
        ${this.findWhereArchivedConditions(
          (alias || childEntity) + 'List',
          parentEntity + 'List',
          true,
        )}
        `,
    );
    this.returns.push(`${alias || childEntity}List`);
    return this;
  }

  public callStart() {
    this.query.raw(`CALL {
      `);
    return this;
  }

  public callEnd() {
    this.query.raw(`
  }
      `);
    return this;
  }

  public createEntitiesByParent(
    childEntity: string,
    parentEntity: string,
    properties: Record<string, any>[],
    relationProperty?: Record<string, any>,
  ): RepositoryQuery {
    const relationName = `${parentEntity}${childEntity}Relation`;
    const relationDefinition = `${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}`;
    properties.forEach((props, i) => {
      // Create unique node name
      const nodeName = `${childEntity}${i}`;
      this.dependencies.add(nodeName);
      if (relationProperty) {
        this.query.merge([
          node(nodeName, childEntity, props),
          relation('in', relationName, relationDefinition, relationProperty),
          node(parentEntity),
        ]);
      } else {
        this.query.merge([
          node(nodeName, childEntity, props),
          relation('in', relationName, relationDefinition),
          node(parentEntity),
        ]);
      }
      this.query
        .setVariables(addCreateDateToProperties(nodeName))
        .with([...this.dependencies.values()].join(','));
      this.returns.push(nodeName);
    });
    return this;
  }

  public createEntityByParent(
    childEntity: string,
    parentEntity: string,
    properties = {},
    relationProperty?: Record<string, any>,
  ): RepositoryQuery {
    this.dependencies.add(childEntity);
    const relationName = `${parentEntity}${childEntity}Relation`;
    const relationDefinition = `${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}`;
    if (relationProperty) {
      this.query.merge([
        node(childEntity, childEntity, properties),
        relation('in', relationName, relationDefinition, relationProperty),
        node(parentEntity),
      ]);
    } else {
      this.query.create([
        node(childEntity, childEntity, properties),
        relation('in', relationName, relationDefinition),
        node(parentEntity),
      ]);
    }
    this.query
      .setVariables(addCreateDateToProperties(childEntity))
      .with([...this.dependencies.values()].join(','));
    this.returns.push(childEntity);
    return this;
  }

  public createInternalRelations(
    childEntity: string,
    parentEntity: string,
    ids: number[],
  ): RepositoryQuery {
    if (ids?.length > 0) {
      this.dependencies.add(`${childEntity}List`);
      this.query.raw(` 
            OPTIONAL MATCH (${childEntity}List:${childEntity}) WHERE ID(${childEntity}List) in [${processEntityIds(
        ids,
      )}]
            MERGE (${parentEntity})-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}List)
            WITH ${[...this.dependencies.values()].join(',')}
        `);
      this.returns.push(`${childEntity}List`);
    }
    return this;
  }

  public createExternalRelations(
    childEntity: string,
    parentEntity: string,
    ids: number[],
  ): RepositoryQuery {
    if (ids?.length > 0) {
      this.dependencies.add(`${childEntity}List`);
      this.query.raw(`
            OPTIONAL MATCH (${childEntity}List:${childEntity}) WHERE ID(${childEntity}List) in [${processEntityIds(
        ids,
      )}]
            ${this.findWhereConditions(childEntity + 'List', parentEntity)}
            MERGE (${parentEntity})<-[${childEntity}${parentEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(${childEntity}List)
            WITH ${[...this.dependencies.values()].join(',')}
        `);
      this.returns.push(`${childEntity}List`);
    }
    return this;
  }

  public createExternalRelation(
    childEntity: string,
    parentEntity: string,
    id: number,
  ): RepositoryQuery {
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

  public createDescendantRelation(
    childEntity: string,
    parentEntity: string,
    id: number,
  ): RepositoryQuery {
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
  
  // public createMemberRelation(
  //   childEntity: string,
  //   parentEntity: string,
  //   id: number,
  // ): RepositoryQuery {
  //   if (id) {
  //     this.dependencies.add(`${childEntity}`);
  //     this.query.raw(`
  //           OPTIONAL MATCH (${childEntity}:${childEntity}) WHERE ID(${childEntity}) = ${id}
  //           MERGE (${parentEntity})-[${childEntity}${parentEntity}Relations:${childEntity.toUpperCase()}_MEMBER_${parentEntity.toUpperCase()}]->(${childEntity})
  //           WITH ${[...this.dependencies.values()].join(',')}
  //       `);
  //     this.returns.push(`${childEntity}`);
  //   }
  //   return this;
  // }
  
  public createMemberRelation(
    userId: number,
    treeId: number,
  ): RepositoryQuery {
    this.query = this.query.raw(`
    MATCH (User:User) WHERE ID(User) = ${userId}
    MATCH (Tree:Tree) WHERE ID(Tree) = ${treeId}

    MERGE (User)-[TreeUserRelations:TREE_MEMBER_USER]->(Tree)
    `);
    
    return this;
  } 
  
  public createMemberAndDescendantRelations(
    userId: number,
    toUserId: number,
    treeId: number,
  ): RepositoryQuery {
    this.query = this.query.raw(`
    MATCH (User1:User) WHERE ID(User1) = ${userId}
    MATCH (User2:User) WHERE ID(User2) = ${toUserId}
    MATCH (Tree:Tree) WHERE ID(Tree) = ${treeId}

    MERGE (User2)<-[UserUserRelations:USER_DESCENDANT_USER]-(User1)
    MERGE (User1)-[TreeUserRelations:TREE_MEMBER_USER]->(Tree)
    `);
    
    return this;
  }
  
  public createMemberAndMarriedRelations(
    userId: number,
    toUserId: number,
    treeId: number,
  ): RepositoryQuery {
    this.query = this.query.raw(`
    MATCH (User1:User) WHERE ID(User1) = ${userId}
    MATCH (User2:User) WHERE ID(User2) = ${toUserId}
    MATCH (Tree:Tree) WHERE ID(Tree) = ${treeId}

    MERGE (User2)<-[UserUserRelations:USER_MARRIED_USER]-(User1)
    MERGE (User1)-[TreeUserRelations:TREE_MEMBER_USER]->(Tree)
    `);
    
    return this;
  }

  public createEntity<T>(entity: string, props: T, uuid = false): RepositoryQuery {
    this.dependencies.add(entity);
   
    if (uuid) {
      this.query = this.connection
      .createNode(entity, entity, props)
      .setVariables(addCreateDateToProperties(entity))
      .setVariables(addUuidToProperties(entity))
      .with([...this.dependencies.values()].join(','));
    } else {
      this.query = this.connection
      .createNode(entity, entity, props)
      .setVariables(addCreateDateToProperties(entity))
      .with([...this.dependencies.values()].join(','));
    }
    
    this.returns.push(entity);
    return this;
  }

  public createNode(entity: string): RepositoryQuery {
    this.query = this.query.raw(`CREATE (${entity}:${entity})`);

    this.returns.push(entity);
    return this;
  }

  private createResult(queryReturns: string[]): string {
    return `{${queryReturns
      .map((queryReturn) => {
        return queryReturn.includes('List')
          ? `${queryReturn}:collect(distinct ${queryReturn})`
          : `${queryReturn}:${queryReturn}`;
      })
      .join(',')}} as data`;
  }

  public async commit() {
    if (
      process.env.NODE_ENV === 'local'
      // || process.env.NODE_ENV === 'test'
    ) {
      console.log(
        this.query.interpolate(),
        '\n ------------END OF QUERY-----------',
      );
    }
    return await this.query.run();
  }

  public async commitWithReturnEntities() {
    this.query.return(this.createResult(this.returns));
    if (
      process.env.NODE_ENV === 'local'
      // || process.env.NODE_ENV === 'test'
    ) {
      console.log(
        this.query.interpolate(),
        '\n ------------END OF QUERY-----------',
      );
    }
    return await this.query.run();
  }

  public async commitWithReturnEntity() {
    this.query.return(this.createResult(this.returns));
    if (
      process.env.NODE_ENV === 'local'
      // || process.env.NODE_ENV === 'test'
    ) {
      console.log(
        this.query.interpolate(),
        '\n ------------END OF QUERY-----------',
      );
    }
    return await this.query.first();
  }

  public async commitWithReturnCount() {
    this.query.return('count(*) as count');
    if (
      process.env.NODE_ENV === 'local'
      // || process.env.NODE_ENV === 'test'
    ) {
      console.log(
        this.query.interpolate(),
        '\n ------------END OF QUERY-----------',
      );
    }
    return await this.query.first();
  }

  public convertEntityByParent(
    fromEntity: string,
    toEntity: string,
    parentEntity: any[],
    properties = {},
  ): RepositoryQuery {
    const [parentEntityName, parentEntityLabel, parentEntityId] = parentEntity;

    this.dependencies.add(toEntity);
    this.dependencies.add(parentEntityName);
    this.query
      .create([
        node(toEntity, toEntity, properties),
        relation(
          'in',
          ``,
          `${toEntity.toUpperCase()}_CONVERTED_FROM_${fromEntity.toUpperCase()}`,
        ),
        node(fromEntity),
      ])
      .setVariables(addCreateDateToProperties(toEntity))
      .raw(
        `
          WITH *
          MATCH (${parentEntityName}:${parentEntityLabel})
          WHERE ID(${parentEntityName}) = ${parentEntityId}
          WITH *
      `,
      )
      .create([
        node(toEntity),
        relation(
          'in',
          `${parentEntityLabel.toUpperCase()}${toEntity.toUpperCase()}Relation`,
          `${parentEntityLabel.toUpperCase()}_INCLUDES_${toEntity.toUpperCase()}`,
        ),
        node(parentEntityName),
      ])
      .with([...this.dependencies.values()].join(','));
    this.returns.push(toEntity, parentEntityName);
    return this;
  }

  public countSearchResultsByParentUsingContains(
    childEntity: string,
    parentEntity: string,
    params: string[],
    query: string,
    findArchived = false,
  ): RepositoryQuery {
    const whereOverrideList = ['Note'];
    if (whereOverrideList.includes(childEntity)) {
      var joinOperator: 'WHERE' | 'AND' | 'OR' = findArchived ? 'AND' : 'WHERE';
    } else {
      var joinOperator: 'WHERE' | 'AND' | 'OR' = findArchived ? 'WHERE' : 'AND';
    }
    const result = this.customWith(`*, ${parentEntity}List as ${parentEntity}`)
      .removeDependencies([`${parentEntity}List`])
      .findEntitiesByParent(childEntity, parentEntity, findArchived)
      .whereCombined(
        params.map((p, idx) => {
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
        }),
        joinOperator,
      )
      .withFirstDistinct([childEntity])
      .raw(`WITH count(${childEntity}) as rowsCount`);
    this.returns = ['rowsCount'];
    return result;
  }

  public countSearchResultsByParentUsingIndex(
    childEntity: string,
    parentEntity: string,
    indexName: string,
    query: string,
  ): RepositoryQuery {
    const searchQuery = query
      .split(' ')
      .map((subQuery) => `*${subQuery}*`)
      .join(' OR ');
    this.query.raw(
      `CALL db.index.fulltext.queryNodes("${indexName}", "${searchQuery}") 
      YIELD node as ${childEntity}
      WHERE (
        EXISTS ((${parentEntity}List)-[:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})) 
        AND ((NOT(${childEntity}.isDeleted) = true OR NOT exists(${childEntity}.isDeleted)))
      )
      WITH count(${childEntity}) as rowsCount
    `,
    );
    this.returns = ['rowsCount'];
    return this;
  }

  public customReturn(query: string): RepositoryQuery {
    this.query.raw(`RETURN
  ${query}      
      `);
    return this;
  }

  public customWith(query: string): RepositoryQuery {
    this.query.raw(`WITH
  ${query}      
      `);
    return this;
  }

  public deleteEntity(entity: string): RepositoryQuery {
    this.query.raw(`DELETE ${entity}`);
    return this;
  }

  public deleteEntityByParent(
    childEntity: string,
    parentEntity: string,
    id: number,
  ): RepositoryQuery {
    if (id > -1) {
      this.query.raw(
        ` 
              MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
              WHERE ID(${childEntity}) = ${id}
              DETACH DELETE ${childEntity}
            `,
      );
    }
    return this;
  } 
  
  public deleteEntityById(
    parentEntity: string,
    id: number,
  ): RepositoryQuery {
    this.query.raw(
      ` 
            MATCH (${parentEntity})
            WHERE ID(${parentEntity}) = ${id}
            DETACH DELETE ${parentEntity}
          `,
    );
    return this;
  }

  public deleteEntitiesByParents(
    childEntity: string,
    parentEntity: string,
  ): RepositoryQuery {
    this.query.raw(
      ` 
          MATCH (${parentEntity}List)-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}List:${childEntity})
          DETACH DELETE ${childEntity}List
          WITH *
        `,
    );
    return this;
  }

  public deleteEntities(entity: string): RepositoryQuery {
    this.query.raw(
      `
          DETACH DELETE ${entity}List
          WITH *
        `,
    );
    return this;
  }

  public deleteRelationsByName(relationName: string): RepositoryQuery {
    this.query.raw(`DELETE ${relationName}`);
    return this;
  }

  public findEntityByChild(
    childEntity: string,
    parentEntity: string,
  ): RepositoryQuery {
    this.query.raw(
      `MATCH (${parentEntity}:${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})
      `,
    );
    return this;
  }

  public findEntitiesByChild(
    childEntity: string,
    parentEntity: string,
  ): RepositoryQuery {
    this.query.raw(
      `MATCH (${parentEntity}List)-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
      `,
    );
    return this;
  }

  public findEntitiesByChildLabel(
    childEntity: string,
    parentEntity: string,
  ): RepositoryQuery {
    this.query.raw(
      `MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})
      `,
    );
    return this;
  }

  public findEntitiesByChildId(
    childEntity: string,
    parentEntity: string,
    childId: number,
    willReturn = false,
  ): RepositoryQuery {
    this.query.raw(
      ` MATCH (${parentEntity}List)-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})

        WHERE id(${childEntity})=${childId}
      `,
    );
    if (willReturn) {
      this.returns.push(childEntity);
    }
    return this;
  }

  public findEntityById(entity: string, id: number): RepositoryQuery {
    this.query.raw(`MATCH (${entity}:${entity})
    WHERE ID(${entity}) = ${id}  
    WITH *               
    `);
    this.returns.push(entity);
    return this;
  }

  public findEntityByIdWithoutName(id: number): RepositoryQuery {
    this.query.raw(`MATCH (n)
    WHERE ID(n) = ${id}  
    WITH *               
    `);
    this.returns.push('n');
    return this;
  }

  public findEntityByIds(entity: string, ids: number[]): RepositoryQuery {
    this.query.raw(`MATCH (${entity}:${entity})
    WHERE ID(${entity}) IN [${ids}]  
    WITH *             
    `);
    this.returns.push(entity);
    return this;
  }

  public findEntityByParent(
    childEntity: string,
    parentEntity: string,
    id?: number,
    willReturn = false,
  ): RepositoryQuery {
    if (!id) {
      this.query.raw(
        ` 
        WITH *  
        OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(Add${childEntity}:${childEntity})         
        `,
      );
    } else if (id > -1) {
      this.query.raw(
        `MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
        WHERE ID(${childEntity}) = ${id}           
        `,
      );
      if (willReturn) {
        this.returns.push(childEntity);
      }
    }
    return this;
  }

  public findEntitiesByParentByProperty(
    childEntity: string,
    parentEntity: string,
    propertyName: string,
    propertyValue: any,
  ): RepositoryQuery {
    this.findEntitiesByParent(childEntity, parentEntity).query.raw(
      `AND ${convert(`${childEntity}.${propertyName}`, propertyValue)}`,
    );
    return this;
  }

  public findEntitiesByParent(
    childEntity: string,
    parentEntity: string,
    fetchArchived = false,
  ): RepositoryQuery {
    this.query.raw(
      `MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
       ${this.findWhereConditions(
         childEntity,
         parentEntity,
         true,
         fetchArchived,
       )}
          `,
    );
    this.returns.push(childEntity);
    return this;
  }

  public findEntitiesByParentByIds(
    childEntity: string,
    parentEntity: string,
    ids: number[],
    attachArchived = false,
  ): RepositoryQuery {
    this.query.raw(
      `
        MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
        WHERE id(${childEntity}) IN [${ids}]
        ${
          attachArchived
            ? ''
            : this.findWhereArchivedConditions(
                childEntity + 'List',
                parentEntity,
                true,
              )
        }
          `,
    );
    this.returns.push(childEntity);
    return this;
  }

  public findEntitiesByParents(
    childEntity: string,
    parentEntity: string,
    fetchArchived = false,
  ): RepositoryQuery {
    this.query.raw(
      ` MATCH (${parentEntity}List)-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
       ${this.findWhereConditions(
         childEntity,
         `${parentEntity}List`,
         true,
         fetchArchived,
       )}
          `,
    );
    this.returns.push(childEntity);
    return this;
  }

  public findEntitiesByParentIfAny(
    childEntity: string,
    parentEntity: string,
  ): RepositoryQuery {
    this.query.raw(
      `OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})`,
    );

    return this;
  }

  public findEntitiesByStatusAndDate(
    childEntity: string,
    parentEntity: string,
    childEntityStatus: string,
    completeDate: any,
  ): RepositoryQuery {
    this.query.raw(
      ` MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
         WHERE ${childEntity}.status = '${childEntityStatus}'
         AND datetime(${childEntity}.completeDate).year = ${completeDate.year}
         AND datetime(${childEntity}.completeDate).month = ${completeDate.month}
          `,
    );
    this.returns.push(childEntity);
    return this;
  }

  public findEntitiesByStatus(
    childEntity: string,
    parentEntity: string,
    childEntityStatus: string,
  ): RepositoryQuery {
    this.query.raw(
      ` MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
         WHERE ${childEntity}.status = '${childEntityStatus}'
          `,
    );
    this.returns.push(childEntity);
    return this;
  }

  public findWhereConditions(
    childEntity: string,
    parentEntity: string,
    where?: boolean,
    findArchived = false,
  ) {
    const arr = ['Note', 'Workspace', 'WorkspaceList', 'Tag', 'TagList'];

    const whereStmt = where ? 'WHERE' : 'AND';

    if (arr.includes(childEntity)) {
      return `${whereStmt} (NOT(${childEntity}.isDeleted) = true
     OR ${childEntity}.isDeleted IS NULL)
    ${
      findArchived
        ? ''
        : this.findWhereArchivedConditions(childEntity, parentEntity)
    } 
     `;
    } else {
      return `${
        findArchived
          ? ''
          : this.findWhereArchivedConditions(childEntity, parentEntity, where)
      }`;
    }
  }

  public findWhereParentNotArchived(parentEntity: string) {
    this.query.raw(
      `${this.findWhereArchivedConditions(parentEntity, null, true)}`,
    );
    return this;
  }

  public findWhereArchivedConditions(
    childEntity: string,
    parentEntity: string,
    where?: boolean,
  ) {
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
    } else {
      query = `AND ` + query;
      return arr.includes(childEntity) ? query : '';
    }
  }

  public findUserByEmail(email: string): RepositoryQuery {
    this.dependencies.add('User');
    this.query = this.connection
      .match([
        node('User', 'User', {
          email,
        }),
      ])
      .with([...this.dependencies.values()].join(','));

    this.returns.push('User');
    return this;
  }

  public findUsersByEmails(emails: Array<string>): RepositoryQuery {
    this.dependencies.add('User');
    this.query.raw(`
      MATCH (UserList:User) 
      WHERE UserList.email IN [${emails.map((e) => JSON.stringify(e))}]
    `);

    this.returns.push('User');
    return this;
  }

  public groupChildIntoParentAndReturn(
    childEntity: string,
    parentEntity: string,
    willReturn = true,
  ) {
    if (willReturn) {
      this.query.raw(`RETURN`);
    }
    this.query.raw(
      `${parentEntity}{.*, id: id(${parentEntity}), ${childEntity}: COLLECT(DISTINCT ${childEntity}{.* ,id: id(${childEntity})})}`,
    );
    if (willReturn) {
      this.query.raw(`as data`);
    }
    return this;
  }

  public markDeletedEntityByParent(
    childEntity: string,
    parentEntity: string,
    id: number,
  ): RepositoryQuery {
    this.dependencies.add(childEntity);
    this.query.raw(
      ` MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]-(${childEntity}:${childEntity})
        WHERE ID(${childEntity}) = ${id}
        SET ${childEntity}.isDeleted = true
        SET ${parentEntity}${childEntity}Relation.isDeleted = true
        WITH *
          `,
    );
    return this;
  }

  public mergeAndSetValuesOnRelation(
    childEntity: string,
    parentEntity: string,
    toSetProperties?: { value: any; property: string; cypher?: string }[],
  ): RepositoryQuery {
    this.query.raw(
      `MERGE (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})`,
    );

    if (toSetProperties?.length) {
      this.query.raw(
        `SET ${toSetProperties
          .map(({ value, property, cypher }) => {
            if (typeof value === 'string') {
              value = `'${value}'`;
            }

            if (Object.is(value, null)) {
              value = cypher;
            }

            return `${parentEntity}${childEntity}Relation.${property} = ${value}`;
          })
          .join(', ')}`,
      );
    }
    this.returns.push(`${parentEntity}${childEntity}Relation`);
    return this;
  }

  public moveEntityToParent = (
    childEntity: string,
    parentEntity: string,
    id: number,
  ): RepositoryQuery => {
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

  public raw(query: string): RepositoryQuery {
    this.query.raw(query);
    return this;
  }

  public resetClass() {
    this.returns = [];
    this.dependencies = new Set<string>();
  }

  public removeDependencies(deps: string[]): RepositoryQuery {
    deps.forEach((d) => {
      this.dependencies.delete(`${d}`);
      this.returns = this.returns.filter((val) => val !== d);
    });
    return this;
  }

  public removeRelationFromEntityToParent = (
    childEntity: string,
    parentEntity: string,
  ): RepositoryQuery => {
    this.dependencies.add(`${childEntity}`);
    this.query.raw(`
                OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]-(${childEntity})
                DELETE ${parentEntity}${childEntity}Relation
                WITH *
            `);
    return this;
  };

  public resolveEntityByInternalRelation = (
    childEntity: string,
    parentEntity: string,
  ): RepositoryQuery => {
    this.dependencies.add(childEntity);
    this.query.raw(`
      OPTIONAL MATCH (${parentEntity})-[:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}:${childEntity})
    `);
    return this;
  };

  public resolveInternalRelations = (
    childEntity: string,
    parentEntity: string,
    ids: number[],
    findArchived = false,
    customWith = `*`,
  ): RepositoryQuery => {
    if (ids?.length > 0) {
      this.dependencies.add(`${childEntity}List`);
      this.query.raw(`  
                OPTIONAL MATCH (${parentEntity})-[removed${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(removed${childEntity}List:${childEntity}) 
                DELETE removed${childEntity}Relations
                WITH *
                OPTIONAL MATCH (${childEntity}List:${childEntity}) WHERE ID(${childEntity}List) in [${processEntityIds(
        ids,
      )}]

                ${this.findWhereConditions(
                  childEntity + 'List',
                  parentEntity,
                  undefined,
                  findArchived,
                )}
                MERGE (${parentEntity})-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}List)
                WITH ${customWith}
            `);
      this.returns.push(`${childEntity}List`);
    } else if (ids?.length == 0) {
      this.query.raw(`  
                OPTIONAL MATCH (${parentEntity})-[removed${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(removed${childEntity}List:${childEntity}) 
                DELETE removed${childEntity}Relations
                WITH ${customWith}
            `);
    } else {
      this.attachInternalEntitiesByParent(childEntity, parentEntity);
    }
    return this;
  };

  public resolveExternalRelations = (
    childEntity: string,
    parentEntity: string,
    ids: number[],
  ): RepositoryQuery => {
    if (ids?.length > 0) {
      this.dependencies.add(`${childEntity}List`);
      this.query.raw(`  
                OPTIONAL MATCH (${parentEntity})<-[removed${childEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(removed${childEntity}List:${childEntity}) 
                DELETE removed${childEntity}Relations
                WITH *
                OPTIONAL MATCH (${childEntity}List:${childEntity}) WHERE ID(${childEntity}List) in [${processEntityIds(
        ids,
      )}]
                ${this.findWhereConditions(childEntity + 'List', parentEntity)}
                MERGE (${parentEntity})<-[${parentEntity}${childEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(${childEntity}List)
                WITH *
            `);
      this.returns.push(`${childEntity}List`);
    } else if (ids?.length == 0) {
      this.query.raw(`  
                OPTIONAL MATCH (${parentEntity})<-[removed${childEntity}Relations:${childEntity.toUpperCase()}_INCLUDES_${parentEntity.toUpperCase()}]-(removed${childEntity}List:${childEntity}) 
                DELETE removed${childEntity}Relations
                WITH *
            `);
    } else {
      this.attachExternalEntitiesByParent(childEntity, parentEntity);
    }
    return this;
  };

  public resolveExternalRelation = (
    childEntity: string,
    parentEntity: string,
    id?: number,
    attachArchived = false,
  ): RepositoryQuery => {
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
    } else {
      this.attachExternalEntityByParent(
        childEntity,
        parentEntity,
        attachArchived,
      );
    }
    return this;
  };

  public resolveEntityOrDefaultByParent(
    childEntity: string,
    parentEntity: string,
    id: number,
    customWith?: string[],
  ): RepositoryQuery {
    if (id > -1) {
      this.dependencies.add(childEntity);
      this.findEntityByParent(childEntity, parentEntity, id, true);

      if (customWith?.length) {
        this.query.raw(`WITH ${customWith.join(', ')}`);
      } else {
        this.query.with([...this.dependencies.values()].join(','));
      }
    } else {
      this.resolveDefaultEntityByParent(childEntity, parentEntity);
    }
    return this;
  }

  public resolveEntitiesByParent(
    childEntity: string,
    parentEntity: string,
    withClause = true,
  ): RepositoryQuery {
    this.dependencies.add(`${childEntity}List`);
    this.query.raw(
      `WITH * OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relation:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}List:${childEntity})
       ${this.findWhereConditions(`${childEntity}List`, parentEntity, true)}
          `,
    );
    
    if (withClause) {
      this.query.with([...this.dependencies.values()].join(','));
    }
    this.returns.push(`${childEntity}List`);
    return this;
  }

  public resolveEntitiesByParentWhereRelationExists(
    childEntity: string,
    parentEntity: string,
    relation: string[],
    attachArchived = true,
    includeWith = true,
  ): RepositoryQuery {
    const [relationChildEntity, relationParentEntity] = relation;
    this.dependencies.add(`${childEntity}List`);
    let query = `OPTIONAL MATCH (${parentEntity})-[${parentEntity}${childEntity}Relations:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity}List:${childEntity})`;

    if (attachArchived) {
      query += `
      WHERE 
        EXISTS(
        (${relationParentEntity}List)-[:${relationParentEntity.toUpperCase()}_INCLUDES_${relationChildEntity.toUpperCase()}]->(${relationChildEntity}List)
      )`;
    } else {
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

  public resolveDefaultEntityByParent(
    childEntity: string,
    parentEntity: string,
  ): RepositoryQuery {
    this.dependencies.add(childEntity);
    this.query
      .match([
        node(childEntity, childEntity, { name: 'General' }),
        relation(
          'in',
          '',
          `${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}`,
        ),
        node(parentEntity),
      ])
      .with([...this.dependencies.values()].join(','));
    this.returns.push(childEntity);
    return this;
  }

  public resolveDefaultEntityByName(
    childEntity: string,
    parentEntity: string,
    nameEntity: string,
  ): RepositoryQuery {
    this.dependencies.add(childEntity);
    this.query
      .match([
        node(childEntity, childEntity, { name: nameEntity }),
        relation(
          'in',
          `${parentEntity}${childEntity}Relation`,
          `${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}`,
        ),
        node(parentEntity),
      ])
      .with([...this.dependencies.values()].join(','));
    this.returns.push(childEntity);
    return this;
  }

  public resolveEntitiesByIds(
    entity: string,
    ids: number[],
    willReturn = false,
    customWith?: string[],
    includeWith = true,
  ): RepositoryQuery {
    this.dependencies.add(`${entity}List`);
    this.query.raw(`
      OPTIONAL MATCH (${entity}List:${entity}) 
      WHERE id(${entity}List) IN [${ids}]
    `);
    if (includeWith) {
      if (customWith.length) {
        this.query.raw(`WITH ${customWith.join(', ')}`);
      } else {
        this.query.with([...this.dependencies.values()].join(','));
      }
    }
    if (willReturn) this.returns.push(`${entity}List`);
    return this;
  }

  
  public searchEntitiesByParentUsingContains(
    childEntity: string,
    parentEntity: string,
    params: string[],
    query: string,
    findArchived = false,
  ): RepositoryQuery {
    const whereOverrideList = ['Note'];
    if (whereOverrideList.includes(childEntity)) {
      var joinOperator: 'WHERE' | 'AND' | 'OR' = findArchived ? 'AND' : 'WHERE';
    } else {
      var joinOperator: 'WHERE' | 'AND' | 'OR' = findArchived ? 'WHERE' : 'AND';
    }
    // eslint-disable-next-line prettier/prettier
    query = query.replace(/&#92;/g, '\\');
    query = JSON.stringify(query.replace(/\"/gi, `\"`));
    this.findEntitiesByParents(childEntity, parentEntity, findArchived)
      .whereCombined(
        params.map((p, idx) => {
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
        }),
        joinOperator,
      )
      .removeDependencies([childEntity, 'UserWorkspaceRelation'])
      .withFirstDistinct([childEntity, ...this.dependencies.values()])
      .addDependencies([childEntity], true);

    return this;
  }

  public searchEntitiesByParentUsingIndex(
    childEntity: string,
    parentEntity: string,
    indexName: string,
    query: string,
    offset?: number,
    limit?: number,
  ): RepositoryQuery {
    return this.searchByParent(
      childEntity,
      parentEntity,
      parentEntity,
      indexName,
      query,
      offset,
      limit,
    );
  }

  public searchEntitiesByParentsUsingIndex(
    childEntity: string,
    parentEntity: string,
    indexName: string,
    query: string,
    offset?: number,
    limit?: number,
  ): RepositoryQuery {
    return this.searchByParent(
      childEntity,
      parentEntity,
      `${parentEntity}List`,
      indexName,
      query,
      offset,
      limit,
    );
  }

  private searchByParent(
    childEntity: string,
    parentEntity: string,
    parentEntityName: string,
    indexName: string,
    query: string,
    offset = 0,
    limit = 1000,
  ): RepositoryQuery {
    const searchQuery = query
      .split(' ')
      .map((subQuery) => `*${subQuery}*`)
      .join(' OR ');

    const skip = offset * limit;
    this.query.raw(
      `CALL db.index.fulltext.queryNodes("${indexName}", "${searchQuery}") 
      YIELD node as ${childEntity}
      WHERE (
        EXISTS ((${parentEntityName})-[:${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}]->(${childEntity})) 
        AND ((NOT(${childEntity}.isDeleted) = true OR ${childEntity}.isDeleted IS NULL))
      )
      WITH *, ${childEntity} SKIP ${skip} LIMIT ${limit}
    `,
    );
    this.returns.push(childEntity);
    return this;
  }

  public searchInvitedUserEntities(
    childEntity: string,
    indexName: string,
    query: string,
    offset = 0,
    limit = 1000,
  ): RepositoryQuery {
    const searchQuery = query
      .split(' ')
      .map((subQuery) => `*${subQuery}*`)
      .join(' OR ');

    const skip = offset * limit;
    this.query.raw(
      `CALL db.index.fulltext.queryNodes("${indexName}", "${searchQuery}") 
      YIELD node as ${childEntity}
      WHERE ID(User) IN RootUser.invitedUsersIds
      WITH *, ${childEntity} SKIP ${skip} LIMIT ${limit}
    `,
    );
    this.returns.push(childEntity);
    return this;
  }

  public setPropertyOnEntity(
    entity: string,
    toSetProperties: Record<string, any> = {},
  ): RepositoryQuery {
    toSetProperties = addUpdateDateToProperties(undefined, toSetProperties);
    this.query.raw(
      `SET ${Object.entries(toSetProperties)
        .map(([property, value]) => {
          if (typeof value === 'string' && !value.match('apoc')) {
            value = `'${value}'`;
          }

          if (Array.isArray(value)) {
            value = `[${value}]`;
          }

          return `${entity}.${property} = ${value}`;
        })
        .join(', ')}`,
    );

    return this;
  }

  public setWorkspaceHistoryEntityByParent = (
    childEntity: string,
    parentEntity: string,
    workspaceHistoryId: number,
    workspaceId: number,
  ): RepositoryQuery => {
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

  public unionCallProcessing = (
    subQueries: RepositoryQuery[],
    returnEntities: string[][],
  ): RepositoryQuery => {
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
            .map(
              (sub) => `
                ${sub.query
                  .raw('WITH *')
                  .return(entityDefinitions)
                  .build()
                  .replace(';', '')}`,
            )
            .join(' UNION ')}
        }
      `);
    this.returns.push(...entities);

    return this;
  };

  public union(all = false) {
    if (all) {
      this.query.raw(`
      UNION ALL`);
    } else {
      this.query.raw(`
      UNION`);
    }
    return this;
  }

  public unwindEntities(entityList: string, toEntity: string): RepositoryQuery {
    this.query.raw(`UNWIND ${entityList}List as ${toEntity}`);
    return this;
  }

  public updateEntity(childEntity: string, properties = {}): RepositoryQuery {
    if (Object.keys(properties).length) {
      this.query
        .setValues(properties)
        .setVariables(addUpdateDateToProperties(childEntity))
        // .with([...this.dependencies.values()].join(','));
    }
    this.returns.push(childEntity);
    return this;
  }

  public updateEntityList(
    childEntity: string,
    properties = {},
  ): RepositoryQuery {
    if (Object.keys(properties).length) {
      this.query
        .setValues(properties)
        .setVariables(addUpdateDateToProperties(`${childEntity}List`))
        .with([...this.dependencies.values()].join(','));
    }
    this.returns.push(`${childEntity}List`);
    return this;
  }

  public updateEntityByParent(
    childEntity: string,
    parentEntity: string,
    properties = {},
    id: number,
  ): RepositoryQuery {
    this.dependencies.add(childEntity);
    this.query
      .match([
        node(childEntity, childEntity),
        relation(
          'in',
          `${parentEntity}${childEntity}Relation`,
          `${parentEntity.toUpperCase()}_INCLUDES_${childEntity.toUpperCase()}`,
        ),
        node(parentEntity),
      ])
      .raw(`WHERE ID(${childEntity}) = ${id}`)
      .setValues(properties)
      .setVariables(addUpdateDateToProperties(childEntity))
      .with([...this.dependencies.values()].join(','));
    this.returns.push(childEntity);
    return this;
  }

  public updateOutcomeAllActionsDoneOnActionChange(toAddDependencies = []) {
    toAddDependencies.forEach((dep) => {
      this.dependencies.add(dep);
    });

    const query = `
    WITH ${
      [...this.dependencies.values()].join(',') +
      ', COLLECT(DISTINCT AddAction) as AllActions'
    }
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

  public updateOutcomeAllActionsDoneOnOutcomeChange(
    actionIds: number[],
    tagIds: number[],
  ) {
    let query = ``;
    if (!actionIds?.length) {
      query = `SET Outcome.isAllActionsDone = null
      SET Outcome._previousIsAllActionsDone = null  
      WITH *
      `;
    } else {
      let toAddDependencies = ['User', 'Workspace', 'Outcome'];

      if (tagIds?.length) {
        toAddDependencies = [...toAddDependencies, 'TagList'];
      } else {
        this.removeDependencies(['TagList']);
      }
      this.addDependencies(toAddDependencies);

      this.dependencies.delete('ActionList');
      query += `
        WITH ${[...this.dependencies.values()].join(
          ', ',
        )}, ActionList as AllActionList
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

  public whereCombined(
    params: { query: string; joinOperator?: 'AND' | 'OR' }[],
    startOperator: 'WHERE' | 'AND' | 'OR' = 'WHERE',
  ): RepositoryQuery {
    this.query.raw(`${startOperator} (`);
    params.forEach(({ query, joinOperator }) => {
      this.query.raw(`${query} `);
      if (joinOperator) {
        this.query.raw(`${joinOperator} `);
      } else {
        this.query.raw(`)`);
      }
    });
    return this;
  }

  public wherePropertyValue(
    entity: string,
    param: string,
    values,
    addNOTcondition = false,
    startOperator: 'WHERE' | 'AND' | 'OR' = 'WHERE',
  ): RepositoryQuery {
    let operator = '=';
    if (Array.isArray(values)) {
      operator = 'IN';
      values = `[${values.map((e) => (typeof e === 'string' ? `'${e}'` : e))}]`;
    } else {
      values = typeof values === 'string' ? `'${values}'` : values;
    }

    if (param.toLowerCase() === 'id') {
      var property = `ID(${entity})`;
    } else {
      var property = `${entity}.${param}`;
    }

    const searchQuery = `${property} ${operator} ${values}`;
    if (addNOTcondition) {
      this.query.raw(`${startOperator} NOT (${searchQuery})`);
    } else {
      this.query.raw(`${startOperator} ${searchQuery}`);
    }

    return this;
  }

  public withFirstDistinct(dependencies: string[] = []) {
    if (dependencies?.length) {
      this.query.raw(`WITH DISTINCT ${dependencies.join(', ')}`);
    } else {
      this.query.raw(
        `WITH DISTINCT ${[...this.dependencies.values()].reverse().join(',')}`,
      );
    }
    return this;
  }
}

export function addCreateDateToProperties(
  entity: string,
  properties = {},
): Record<string, string> {
  const timestamp = Date.now();
  if (entity) {
    properties = {
      ...properties,
      [`${entity}.createDate`]:
      `${timestamp}`
    };
  } else {
    properties = {
      ...properties,
      createDate: `${timestamp}`,
    };
  }
  return properties;
}

export function addUuidToProperties(
  entity: string,
  properties = {},
): Record<string, string> {
  let newUuid = uuidv4();
  if (entity) {
    properties = {
      ...properties,
      [`${entity}.uuid`]:
      `'${newUuid}'`
    };
  } else {
    properties = {
      ...properties,
      uuid: `'${newUuid}'`,
    };
  }
  return properties;
}

export function addUpdateDateToProperties(
  entity: string,
  properties = {},
): Record<string, string> {
  const timestamp = Date.now();
  if (entity) {
    properties = {
      ...properties,
      [`${entity}.updateDate`]:
        `${timestamp}`
    };
  } else {
    properties = {
      ...properties,
      updateDate: `${timestamp}`,
    };
  }
  return properties;
}

export const processEmptyNestedArray = (arr) => {
  if (arr?.length < 1) {
    return [];
  }

  return arr?.filter((x) => {
    if (Array.isArray(x)) {
      return x.length > 0;
    }
    return true;
  });
};

export const processEntityIds = (array: any): string => {
  if (array) {
    return array
      .map((o) => {
        return o;
      })
      .join(',');
  } else {
    return '-1';
  }
};

export const processArrayProperty = (array: any) => {
  if (array?.length > 0) {
    return array.map((o) => {
      return mapCypherResultToEntity(o);
    });
  } else {
    return [];
  }
};

export const buildTree = (data: any) => {
  // @ts-ignore
  let descendant = this.getDescendantRel(data.rList);
  // @ts-ignore
  let married = this.getMarriedRel(data.rList);
  // @ts-ignore
  let rootUser = this.getRootUser(data.nList, descendant, married);
  // @ts-ignore
  let tree = this.buildTreeFromRelations(rootUser, data.nList, descendant, married);

  return tree;
};

export const getDescendantRel = (data: any) => {
  let result = [];
  for (let rel of data) {
    for (let item of rel) {
      if (item.label === 'USER_DESCENDANT_USER') {
        result.push(item);
      }
    }
  }
  // @ts-ignore
  let res = this.removeDuplicates(result, "identity");
  return res;
};

export const getMarriedRel = (data: any) => {
  let result = [];
  for (let rel of data) {
    for (let item of rel) {
      if (item.label === "USER_MARRIED_USER") {
        result.push(item);
      }
    }
  }
  // @ts-ignore
  let res = this.removeDuplicates(result, "identity");
  return res;
};

export const removeDuplicates = (originalArray, prop) => {
  var newArray = [];
  var lookupObject  = {};

  for(var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for(i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;
};

export const getRootUser = (members, descendantRels, marriedRel) => {
  const resultWithoutDescendantRels = members.filter(e => !descendantRels.find(a => e.identity == a.start));
  const resultWithoutMarriedRel = resultWithoutDescendantRels.filter(e => !marriedRel .find(a => e.identity == a.start));
  const rootUser = resultWithoutMarriedRel.filter(object => {
    return object.labels[0] !== 'Tree';
  });
  return rootUser;
};

export const buildTreeFromRelations = (rootUser, members, descendantRels, marriedRel) => {

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
  //   for (let item of descendantRels) {
  //     for (let itemMember of members) {
  //       if (!tree.length) {
  //         let resultMember = members.filter(obj => {
  //           return obj.identity == rootUser[0].identity
  //         })
  //         tree.push({
  //           ...resultMember
  //         });
  //       }
  //
  //       if (item.end === itemMember.identity && tree.length) {
  //
  //         let resultMember = members.filter(obj => {
  //           return obj.identity == item.start
  //         })
  //
  //         let resultMarriedMember = members.filter(obj => {
  //           return obj.end == item.end
  //         })
  //
  //         // console.log('itemMember', itemMember);
  //         // console.log('resultMember', resultMember);
  //
  //         //Find index of specific object using findIndex method.
  //         let treeIndex = tree.findIndex((obj => obj.identity == resultMember.identity));
  //         if (!tree[treeIndex].descendant) {
  //           tree[treeIndex].descendant = [];
  //         }
  //         if (!tree[treeIndex].married) {
  //           tree[treeIndex].married = [];
  //         }
  //         if (resultMarriedMember) {
  //           tree[treeIndex].married.push(resultMarriedMember);
  //         }
  //
  //         tree[treeIndex].descendant.push(resultMember);
  //
  //         // itemMember.push({
  //         //   descendant: [],
  //         //   married: []
  //         // });
  //       }
  //     }
  // } //--------------11-----------------------

   const partial = (descendantRels = [], condition) => {
    const result = [];
    for (let i = 0; i < descendantRels.length; i++) {
      if(condition(descendantRels[i])){
        result.push(descendantRels[i]);
      }
    }
    return result;
 }
  const findNodes = (parentKey, items, members) => {
    let subItems = partial(items, n => {
     return n.end == parentKey});
    const result = [];
    for (let i = 0; i < subItems.length; i++) {
      let subItem = subItems[i];
      let resultItem = members.filter(obj => {
        return obj.identity == subItem.start
      });
      let married = findNodes(subItem.start , marriedRel, members);
      if(married.length){
        // @ts-ignore
        resultItem.push({
          married : married,
          ...resultItem
        })
      }

      let descendants = findNodes(subItem.start , items, members);
      if(descendants.length){
        // @ts-ignore
        resultItem.push({
          descendant : descendants,
          ...resultItem
        })
      }
      result.push(resultItem);
    }
    return result;
  }
  let treeResult = findNodes('ROOT', descendantRels, members);

  return treeResult;
};

export const Return = (array: any, ...args: any[]) => {
  return [...array, ...args.filter((a) => a)];
};

export const mapCypherResultToEntity = (input: any, expand: any = {}) => {
  return !!input
    ? { id: input.identity, ...input.properties, ...expand }
    : null;
};
