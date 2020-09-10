import { SetMetadata } from '@nestjs/common';
export const AutomatedUsersAccess = () => SetMetadata('allowAutomatedPasswordUsers', true);
