import { Blog, Post, SocialAccount, Profile } from '../substrate/interfaces';
import { CommonContent, BlogContent, PostContent, CommentContent, ProfileContent } from '../offchain'
import { CommonStruct } from '../substrate';

export type CommonData<S extends CommonStruct, C extends CommonContent> = {
  struct: S,
  content?: C
}

export type BlogData = CommonData<Blog, BlogContent>
export type PostData = CommonData<Post, PostContent>
export type CommentData = CommonData<Post, CommentContent>
export type ProfileData = CommonData<SocialAccount, ProfileContent> & {
  profile?: Profile,
}

export type AnySubsocialData = BlogData | PostData | CommentData | ProfileData;

export type ExtendedPostData = {
  post: PostData,
  ext?: PostData,
  owner?: ProfileData
}

export type ExtendedCommentData = {
  comment: CommentData,
  owner?: ProfileData
}
