import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/modules/landing/components/Footer";
import ProfilePage from "@/src/modules/auth/components/ProfilePage";

export default function ProfileRoute() {
    return (
        <>
            <Navbar />
            <ProfilePage />
            <Footer />
        </>
    );
}
