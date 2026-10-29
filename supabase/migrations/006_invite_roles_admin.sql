-- Allow inviting admins, marketers, or reviewers (one role per person).

alter table public.invitations
  drop constraint if exists invitations_role_check;

alter table public.invitations
  add constraint invitations_role_check
  check (role in ('admin', 'marketer', 'reviewer'));
