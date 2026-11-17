import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
export const getCustomCategories=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {data,error}=await context.supabase.rpc("category_admin_data");if(error)throw new Error("Admin access required");return data as unknown as {id:string;label:string;count:number}[];
});
export const categoryAction=createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator(z.object({action:z.enum(["add","rename","reorder","promote"]),payload:z.record(z.union([z.string().max(100),z.array(z.string().uuid())]))})).handler(async({data,context})=>{
  const result=await context.supabase.rpc("category_action",data);if(result.error)throw new Error(result.error.message);return result.data;
});