type PaginationSortTypes = {
  limit?: number | string;
  page?: number | string;
  sortBy?: string;
  sortOrder?: string;
};

type PaginationSortTypesReturn = {
  limit: number;
  page: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};

const paginationAndSortgHelper = (
  options: PaginationSortTypes,
): PaginationSortTypesReturn => {
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 8;

  const skip: number = (page - 1) * limit;

  //sorting
  const sortOrder: string = options.sortOrder || "asc";
  const sortBy: string = options.sortBy || "createdAt";

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export default paginationAndSortgHelper;
