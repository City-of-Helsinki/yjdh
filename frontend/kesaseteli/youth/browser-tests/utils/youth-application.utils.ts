import {
  fakeNinethGraderSSN,
  fakeUpperSecondaryEducation1stYearStudentSSN,
  fakeYouthApplication,
  fakeYouthTargetGroupAgeSSN,
} from '@frontend/kesaseteli-shared/src/__tests__/utils/fake-objects';
import YouthApplication from '@frontend/kesaseteli-shared/src/types/youth-application';
import { fakeSSN } from '@frontend/shared/src/__tests__/utils/fake-objects';
import DeepPartial from '@frontend/shared/src/types/common/deep-partial';

/* Firstname/lastname combinations that cause different replies from VTJ when NEXT_PUBLIC_MOCK_FLAG is on */
export const isDead = {
  first_name: 'VTJ-testi',
  last_name: 'Kuollut',
};

export const vtjDifferentLastName = {
  first_name: 'VTJ-testi',
  last_name: 'Väärä sukunimi',
};

export const vtjNotFound = {
  first_name: 'VTJ-testi',
  last_name: 'Ei löydy',
};

export const vtjTimeout = {
  first_name: 'VTJ-testi',
  last_name: 'Ei vastaa',
};
export const livesInHelsinki = {
  first_name: 'VTJ-testi',
  last_name: 'Kotikunta Helsinki',
};

export const livesOutsideHelsinki = {
  first_name: 'VTJ-testi',
  last_name: 'Kotikunta Utsjoki',
};

export const attendsHelsinkianSchool = {
  is_unlisted_school: false,
};

export const attendsUnlistedSchool = {
  is_unlisted_school: true,
};

export const hasAge = (
  age: number
): Pick<YouthApplication, 'social_security_number'> => {
  const classYear = new Date().getFullYear() - age;
  return { social_security_number: fakeSSN(classYear) };
};

export const is9thGraderAge = (): Pick<
  YouthApplication,
  'social_security_number'
> => ({ social_security_number: fakeNinethGraderSSN() });
export const isUpperSecondaryEducation1stYearStudentAge = (): Pick<
  YouthApplication,
  'social_security_number'
> => ({
  social_security_number: fakeUpperSecondaryEducation1stYearStudentSSN(),
});

export const isYouthTargetGroupAge = (): Pick<
  YouthApplication,
  'social_security_number'
> => ({ social_security_number: fakeYouthTargetGroupAgeSSN() });

// valid application which is automatically accepted by default (when no override values)
export const autoAcceptedApplication = (
  override?: DeepPartial<YouthApplication>
): YouthApplication =>
  fakeYouthApplication({
    ...is9thGraderAge(),
    ...livesInHelsinki,
    ...override,
  });

// invalid application which needs additional info given
export const applicationNeedsAdditionalInfo = (
  override?: DeepPartial<YouthApplication>
): YouthApplication =>
  fakeYouthApplication({ ...hasAge(99), ...livesInHelsinki, ...override });
