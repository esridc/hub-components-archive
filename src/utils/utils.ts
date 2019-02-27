import { request, getPortalUrl } from '@esri/arcgis-rest-request';
import { UserSession } from '@esri/arcgis-rest-auth';
import { IUser } from '@esri/arcgis-rest-common-types';

const getTag = (initiativeId:string) => `hubInitiativeId|${initiativeId}`;

const getUpdateUrl = (session:UserSession) => `${getPortalUrl(session)}/community/users/${session.username}/update`

export const currentlyFollowedInitiatives = (user:IUser):string[] => 
  user.tags.map(tag => tag.replace(/^hubInitiativeId\|/, ''));

export const isUserFollowing = (initiativeId:string):boolean => {
  return this.currentlyFollowedInitiatives.includes(initiativeId);
}

export const followInitiative = (initiativeId:string, user:IUser, authentication:UserSession):Promise<any> => {
  const tag = getTag(initiativeId);
  // don't update if already following
  if (user.tags.includes(tag)) {
    return Promise.reject(`user is already following this initiative`);
  }
  user.tags.push(tag);

  return request(getUpdateUrl(authentication), {
    params: { tags: user.tags },
    authentication 
  });
}

export const unfollowInitiative = (initiativeId:string, user:IUser, authentication:UserSession):Promise<any> => {
  const tag = getTag(initiativeId);
  // don't update if user isn't following
  if (!user.tags.includes(tag)) {
    return Promise.reject(`user isnt following this initiative`);
  }

  // https://stackoverflow.com/questions/9792927/javascript-array-search-and-remove-string
  const index = user.tags.indexOf(tag);
  if (index !== -1) {
      user.tags.splice(index, 1);
   }

  return request(getUpdateUrl(authentication), {
    params: { tags: user.tags },
    authentication 
  });
}