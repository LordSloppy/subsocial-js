export default {
  types: {
    IpfsCid: 'Text',

    SpaceId: 'u64',

    WhoAndWhen: {
      account: 'AccountId',
      block: 'BlockNumber',
      time: 'Moment'
    },

    User: {
      _enum: {
        Account: 'AccountId',
        Space: 'SpaceId'
      }
    },

    Content: {
      _enum: {
        None: 'Null',
        Raw: 'Text',
        IPFS: 'IpfsCid',
        Hyper: 'Text'
      }
    },

    SpaceForRoles: {
      owner: 'AccountId',
      permissions: 'Option<SpacePermissions>'
    },

    Space: {
      id: 'SpaceId',
      created: 'WhoAndWhen',
      updated: 'Option<WhoAndWhen>',

      owner: 'AccountId',

      parent_id: 'Option<SpaceId>',
      handle: 'Option<Text>',
      content: 'Content',
      hidden: 'bool',

      posts_count: 'u16',
      hidden_posts_count: 'u16',
      followers_count: 'u32',

      score: 'i32',

      permissions: 'Option<SpacePermissions>'
    },

    SpaceUpdate: {
      parent_id: 'Option<Option<SpaceId>>',
      handle: 'Option<Option<Text>>',
      content: 'Option<Content>',
      hidden: 'Option<bool>',
      permissions: 'Option<Option<SpacePermissions>>'
    },

    SpaceHistoryRecord: {
      edited: 'WhoAndWhen',
      old_data: 'SpaceUpdate'
    },

    PostId: 'u64',

    Post: {
      id: 'PostId',
      created: 'WhoAndWhen',
      updated: 'Option<WhoAndWhen>',

      owner: 'AccountId',

      extension: 'PostExtension',

      space_id: 'Option<SpaceId>',
      content: 'Content',
      hidden: 'bool',

      replies_count: 'u16',
      hidden_replies_count: 'u16',

      shares_count: 'u16',
      upvotes_count: 'u16',
      downvotes_count: 'u16',

      score: 'i32'
    },

    PostUpdate: {
      space_id: 'Option<SpaceId>',
      content: 'Option<Content>',
      hidden: 'Option<bool>'
    },

    PostExtension: {
      _enum: {
        RegularPost: 'Null',
        Comment: 'Comment',
        SharedPost: 'PostId'
      }
    },

    Comment: {
      parent_id: 'Option<PostId>',
      root_post_id: 'PostId'
    },

    PostHistoryRecord: {
      edited: 'WhoAndWhen',
      old_data: 'PostUpdate'
    },

    SocialAccount: {
      followers_count: 'u32',
      following_accounts_count: 'u16',
      following_spaces_count: 'u16',
      reputation: 'u32',
      profile: 'Option<Profile>'
    },

    Profile: {
      created: 'WhoAndWhen',
      updated: 'Option<WhoAndWhen>',

      handle: 'Text',
      content: 'Content'
    },

    ProfileUpdate: {
      handle: 'Option<Text>',
      content: 'Option<Content>'
    },

    ProfileHistoryRecord: {
      edited: 'WhoAndWhen',
      old_data: 'ProfileUpdate'
    },

    ReactionId: 'u64',

    ReactionKind: {
      _enum: [
        'Upvote',
        'Downvote'
      ]
    },

    Reaction: {
      id: 'ReactionId',
      created: 'WhoAndWhen',
      updated: 'Option<WhoAndWhen>',
      kind: 'ReactionKind'
    },

    ScoringAction: {
      _enum: [
        'UpvotePost',
        'DownvotePost',
        'SharePost',
        'CreateComment',
        'UpvoteComment',
        'DownvoteComment',
        'ShareComment',
        'FollowSpace',
        'FollowAccount'
      ]
    },

    SpacePermissionSet: 'BTreeSet<SpacePermission>',

    SpacePermission: {
      _enum: [
        'ManageRoles',

        'RepresentSpaceInternally',
        'RepresentSpaceExternally',

        'UpdateSpace',

        'CreateSubspaces',
        'UpdateOwnSubspaces',
        'DeleteOwnSubspaces',
        'HideOwnSubspaces',

        'UpdateAnySubspace',
        'DeleteAnySubspace',
        'HideAnySubspace',

        'CreatePosts',
        'UpdateOwnPosts',
        'DeleteOwnPosts',
        'HideOwnPosts',

        'UpdateAnyPost',
        'DeleteAnyPost',
        'HideAnyPost',

        'CreateComments',
        'UpdateOwnComments',
        'DeleteOwnComments',
        'HideOwnComments',

        'HideAnyComment',

        'Upvote',
        'Downvote',
        'Share',

        'OverrideSubspacePermissions',
        'OverridePostPermissions',

        'SuggestEntityStatus',
        'UpdateEntityStatus',

        'UpdateSpaceSettings'
      ]
    },

    SpacePermissions: {
      none: 'Option<SpacePermissionSet>',
      everyone: 'Option<SpacePermissionSet>',
      follower: 'Option<SpacePermissionSet>',
      space_owner: 'Option<SpacePermissionSet>'
    },

    SpacePermissionsContext: {
      space_id: 'SpaceId',
      is_space_owner: 'bool',
      is_space_follower: 'bool',
      space_perms: 'Option<SpacePermissions>'
    },

    RoleId: 'u64',

    Role: {
      created: 'WhoAndWhen',
      updated: 'Option<WhoAndWhen>',
      id: 'RoleId',
      space_id: 'SpaceId',
      disabled: 'bool',
      expires_at: 'Option<BlockNumber>',
      content: 'Content',
      permissions: 'SpacePermissionSet'
    },

    RoleUpdate: {
      disabled: 'Option<bool>',
      content: 'Option<Content>',
      permissions: 'Option<SpacePermissionSet>'
    }
  }
}
