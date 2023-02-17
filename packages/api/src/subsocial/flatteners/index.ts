import { Option } from '@polkadot/types/codec'
import { PalletDomainsDomainMeta } from '@polkadot/types/lookup'
import { Post, Space, SpacePermissionSet, SpacePermissions as BlockchainSpacePermissions, Reaction, WhoAndWhen } from '@subsocial/definitions/interfaces'
import { notEmptyObj } from '@subsocial/utils'
import { DomainStruct, HasCreated, HasUpdated, ReactionEnum, ReactionStruct, SpacePermissionKey, SpacePermissionMap, SpacePermissions, SpacePermissionsKey } from '../../types'
import { CanHaveContent, CanHaveSpaceId, CommentExtension, CommentStruct, CommonContent, EntityData, EntityId, FlatPostExtension, FlatSuperCommon, HasId, HasOwner, PostStruct, SharedPostExtension, SharedPostStruct, SpaceOrPostStruct, SpaceStruct, SuperCommonStruct, FlatSpaceOrPost } from '../../types/'
export * from './utils'

type EntityDataWithField<S extends {}> = EntityData<HasId & S, CommonContent> | (HasId & S)

export function getUniqueIds<S extends {}> (structs: EntityDataWithField<S>[], idFieldName: keyof S): EntityId[] {
  type _EntityData = EntityData<S & HasId, CommonContent>
  const ids = new Set<EntityId>()
  structs.forEach((x) => {
    const edStruct = (x as _EntityData).struct
    const struct = notEmptyObj(edStruct) ? edStruct : x as S
    const id = struct[idFieldName] as unknown as EntityId
    if (id && !ids.has(id)) {
      ids.add(id)
    }
  })
  return Array.from(ids)
}

export const getUniqueOwnerIds = (entities: EntityDataWithField<HasOwner>[]) =>
  getUniqueIds(entities, 'ownerId')

export const getUniqueContentIds = (entities: EntityDataWithField<CanHaveContent>[]) =>
  getUniqueIds(entities, 'contentId')

export const getUniqueSpaceIds = (entities: EntityDataWithField<CanHaveSpaceId>[]) =>
  getUniqueIds(entities, 'spaceId')

function getContentFields ({ content }: SuperCommonStruct): CanHaveContent {
  let res: CanHaveContent = {}
  if (content.isIpfs) {
    res = {
      contentId: content.asIpfs.toHuman()
    }
  }
  return res
}

function flattenCreatedField (struct: Pick<SuperCommonStruct, 'created'>): HasCreated {
  const { created } = struct
  return {
    createdByAccount: created.account.toHuman(),
    createdAtBlock: created.block.toNumber(),
    createdAtTime: created.time.toNumber(),
  }
}

function flattenUpdatedField (struct: { updated: Option<WhoAndWhen> }): HasUpdated {
  const updated = struct.updated.unwrapOr(undefined)
  return {
    updatedByAccount: updated?.account.toHuman(),
    updatedAtBlock: updated?.block.toNumber(),
    updatedAtTime: updated?.time.toNumber(),
  }
}

export function flattenCommonFields (struct: SuperCommonStruct): FlatSuperCommon {
  return {
    ...flattenCreatedField(struct),

    isUpdated: struct.edited.toHuman(),
    ...getContentFields(struct),
  }
}

function flattenSpaceOrPostStruct (struct: SpaceOrPostStruct): FlatSpaceOrPost {
  return {
    ...flattenCommonFields(struct),
    id: struct.id.toString(),
    ownerId: struct.owner.toHuman(),
    hidden: struct.hidden.isTrue,
  }
}

export const flattenPermissions = (permissions?: BlockchainSpacePermissions) => {
  const flatPermissions: SpacePermissions = {}

  if (permissions) {
    for (const [ key, value ] of permissions) {
      const permissionSet = (value as Option<SpacePermissionSet>).unwrapOr(undefined)
      const permission: SpacePermissionMap = {}

      permissionSet?.forEach(x => {
        permission[x.toString() as SpacePermissionKey] = true
      })

      flatPermissions[`${key}Permissions` as SpacePermissionsKey] = permission
    }
  }

  return flatPermissions
}

export function flattenSpaceStruct (struct: Space,): SpaceStruct {
  const flatPermissions = flattenPermissions(struct.permissions.unwrapOr(undefined))

  return {
    ...flattenSpaceOrPostStruct(struct),
    ...flatPermissions,
    canFollowerCreatePosts: !!flatPermissions.followerPermissions?.CreatePosts, //TODO: check CreatePosts permissions in follower set
    canEveryoneCreatePosts: !!flatPermissions.everyonePermissions?.CreatePosts, //TODO: check CreatePosts permissions in everyone set
  }
}

export function flattenSpaceStructs (structs: Space[]): SpaceStruct[] {
  return structs.map(flattenSpaceStruct)
}

function flattenPostExtension (struct: Post): FlatPostExtension {
  const { isSharedPost, isComment, isRegularPost } = struct.extension
  let normExt: FlatPostExtension = {}

  if (isSharedPost) {
    const originalPostId = struct.extension.asSharedPost
    const sharedPost: SharedPostExtension = {
      originalPostId: originalPostId.toString()
    }
    normExt = sharedPost
  } else if (isComment) {
    const { parentId, rootPostId } = struct.extension.asComment
    const comment: CommentExtension = {
      rootPostId: rootPostId.toString()
    }
    if (parentId.isSome) {
      comment.parentId = parentId.unwrap().toString()
    }
    normExt = comment
  }

  return normExt
}

export function flattenPostStruct (struct: Post): PostStruct {
  const { isRegularPost, isSharedPost, isComment } = struct.extension
  const extensionFields = flattenPostExtension(struct)

  let spaceField: CanHaveSpaceId = {}
  if (struct.spaceId.isSome) {
    spaceField = {
      spaceId: struct.spaceId.unwrap().toString(),
    }
  }

  return {
    ...flattenSpaceOrPostStruct(struct),
    ...spaceField,
    ...extensionFields,

    upvotesCount: struct.upvotesCount.toNumber(),
    downvotesCount: struct.downvotesCount.toNumber(),

    isRegularPost,
    isSharedPost,
    isComment,
  }
}

export function flattenPostStructs (structs: Post[]): PostStruct[] {
  return structs.map(flattenPostStruct)
}

export function flattenDomainStruct (struct: PalletDomainsDomainMeta): DomainStruct {
  let innerSpace: string | undefined = undefined
  const innerValue = struct.innerValue.unwrapOr(undefined)
  if (innerValue?.isSpace) {
    innerSpace = innerValue.asSpace.toString()
  }

  return {
    owner: struct.owner.toHuman(),
    expiresAt: struct.expiresAt.toString(),
    outerValue: struct.outerValue.toHuman()?.toString(),
    innerSpace
  }
}

export function flattenDomainStructs (structs: PalletDomainsDomainMeta[]) {
  return structs.map(flattenDomainStruct)
}

export function flattenReaction (rawReaction: Reaction): ReactionStruct {
  return {
    ...flattenCreatedField(rawReaction),
    ...flattenUpdatedField(rawReaction),
    id: rawReaction.id.toString(),
    kind: rawReaction.kind.isUpvote ? ReactionEnum.Upvote : ReactionEnum.Downvote,
  }
}

export function flattenReactions (rawReactions: Reaction[]): ReactionStruct[] {
  return rawReactions.map(flattenReaction)
}
