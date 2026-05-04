export const isFreeCourse = (course: any) => {
  const price = Number(course?.price ?? 0);
  return course?.isFree === true || (Number.isFinite(price) && price <= 0);
};
