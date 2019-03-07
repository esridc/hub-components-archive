import { Component, Prop, State, Listen } from '@stencil/core';
import { UserSession } from '@esri/arcgis-rest-auth';
import { IUser } from '@esri/arcgis-rest-common-types';

import { followInitiative, isUserFollowing, unfollowInitiative } from '../../utils/follow-utils';

@Component({
  tag: 'hub-follow-button',
  styleUrl: 'hub-follow-button.css',
  shadow: true
})

/*
to do:
  could we suss out the community subdomain using initiativeid?
  should we display a custom popup with facebook/google buttons only?
  bonus:
    notify org administrator about new follows
    notify new follows with some canned info
*/
export class HubFollowButton {
  /**
   * ClientID to identify the app launching auth
   */
  @Prop() clientid: string;

  /**
   * identifier for the ArcGIS Hub initiative
   */
  @Prop() initiativeid: string;

  /**
   * identifier for the ArcGIS Hub initiative
   */
  @Prop() communityorg: string;

  /**
   * User metadata
   */
  @Prop({ mutable: true }) user: IUser;

  /**
   * Authentication info.
   */
  @Prop({ mutable: true }) session: UserSession;

  /**
   * Text to display on the button
   */
  @State() callToActionText: string = "Follow Our Initiative";

  @Listen('click')
  handleKeyDown(){
  if (!this.session) {
    // register your own app to create a unique clientId
    UserSession.beginOAuth2({
      clientId: this.clientid,
      portal: `${this.communityorg}/sharing/rest`,
      redirectUri: `${window.location}authenticate.html`
    })
      .then(session => {
        this.session = session;
        this.session.getUser()
          .then((user:UserSession) => {
            this.user = user;
            if (isUserFollowing(this.user, this.initiativeid)) {
              this.callToActionText = "Unfollow Our Inititiave";
            } else {
              this.followOrUnfollow();
            }
          })
      })
    }
    else {
      this.followOrUnfollow();
    }
  }

  followOrUnfollow() {
    if (isUserFollowing(this.user, this.initiativeid)) {
      unfollowInitiative(this.initiativeid, this.user, this.session)
      this.callToActionText = "Follow Our Initiative";
    } else {
      followInitiative(this.initiativeid, this.user, this.session);
      this.callToActionText = "Unfollow Our Initiative";
    }
  }

  render() {
    return <button class="btn">
        <svg draggable="auto" class="follow-icon" viewBox="0 0 120 120" width="100%" height="100%"><circle cx="18.385" cy="101.615" r="18.385"></circle><path d="M-1.031 61c32.533 0 59 26.468 59 59s-26.467 59-59 59-59-26.468-59-59 26.467-59 59-59m0-23c-45.288 0-82 36.713-82 82s36.712 82 82 82 82-36.713 82-82-36.712-82-82-82z"></path><path d="M.154 23.041c53.349 0 96.75 43.402 96.75 96.75s-43.402 96.75-96.75 96.75-96.75-43.402-96.75-96.75 43.402-96.75 96.75-96.75m0-23c-66.136 0-119.75 53.615-119.75 119.75s53.614 119.75 119.75 119.75c66.135 0 119.75-53.615 119.75-119.75S66.289.041.154.041z"></path>
        </svg>
      {this.callToActionText}
      </button>;
  }
}
