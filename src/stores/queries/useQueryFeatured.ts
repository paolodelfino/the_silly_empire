import ActionFetchFeatured from "@/actions/ActionFetchFeatured";
import { createQuery } from "@/utils/query";

const useQueryFeatured = createQuery(() => ActionFetchFeatured(), undefined);
export default useQueryFeatured;
