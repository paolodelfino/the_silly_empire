import { keys } from "@/keys";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  async function setKey(formData: FormData) {
    "use server";

    const key = formData.get("key")?.toString();
    if (key !== undefined && keys.includes(key)) {
      (await cookies()).set("key", key, {
        maxAge: 31536000,
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        priority: "high",
      });
      redirect("/");
    }
  }

  return (
    <form action={setKey} className="mx-auto flex w-full max-w-4xl flex-col">
      <input
        name="key"
        defaultValue={searchParams["key"]}
        className="h-12 w-full pl-4"
        placeholder="Key"
      />
      <button className="h-12 w-full bg-neutral-600">Submit</button>
    </form>
  );
}
