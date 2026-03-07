import PostRequirementForm from "@/components/requirements/PostRequirementForm"; // Adjust path if needed

export const metadata = {
  title: 'Post a Requirement | Servebasiq ',
  description: 'Tell us what you need and get connected with the right professionals or products.',
};

export default function PostRequirementPage() {
    return (
        <main>
            <PostRequirementForm />
        </main>
    );
}