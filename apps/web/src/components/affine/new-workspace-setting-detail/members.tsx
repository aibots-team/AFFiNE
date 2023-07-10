import { Button, Input } from '@affine/component';
import { SettingRow } from '@affine/component/setting-components';
import { WorkspaceFlavour } from '@affine/env/workspace';
import { inviteByEmailMutation, Permission } from '@affine/graphql';
import { useMutation } from '@affine/workspace/affine/gql';
import type { ReactElement } from 'react';
import { Suspense, useCallback, useState } from 'react';

import { useMembers } from '../../../hooks/affine/use-members';
import type { AffineOfficialWorkspace } from '../../../shared';
import { toast } from '../../../utils';
import { PermissionSelect } from './permission-select';

export type MembersPanelProps = {
  workspace: AffineOfficialWorkspace;
};

export const CloudWorkspaceMembersPanel = (
  props: MembersPanelProps
): ReactElement => {
  const workspaceId = props.workspace.id;
  const members = useMembers(workspaceId);

  const [inviteEmail, setInviteEmail] = useState('');
  const [permission, setPermission] = useState(Permission.Write);
  const { trigger } = useMutation({
    mutation: inviteByEmailMutation,
  });

  const memberCount = members.length;
  const memberPanel =
    memberCount > 0 ? (
      members.map(member => <div key={member.id}>{member.name}</div>)
    ) : (
      <div>No Members</div>
    );

  return (
    <>
      <SettingRow name="Members" desc="" />
      <div>
        <Input
          data-testid="invite-by-email-input"
          placeholder="Invite by email"
          onChange={setInviteEmail}
        />
        <PermissionSelect value={permission} onChange={setPermission} />
        <Button
          onClick={useCallback(async () => {
            const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            if (!emailRegex.test(inviteEmail)) {
              // fixme: hidden behind the setting modal
              toast('Invalid email');
              return;
            }

            await trigger({
              workspaceId,
              email: inviteEmail,
              permission,
            });
          }, [inviteEmail, trigger, workspaceId, permission])}
        >
          Invite
        </Button>
      </div>
      {memberPanel}
    </>
  );
};

export const MembersPanel = (props: MembersPanelProps): ReactElement | null => {
  if (props.workspace.flavour === WorkspaceFlavour.LOCAL) {
    return null;
  }
  return (
    <Suspense>
      <CloudWorkspaceMembersPanel {...props} />
    </Suspense>
  );
};
