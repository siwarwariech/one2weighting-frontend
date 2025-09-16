import Header from "@/components/Header";
import SignInForm from "@/components/Auth/SignInForm";
import hero from "@/assets/hero.jpg";

export default function SignIn() {
  return (
    <>
      <Header />                               {/* ← ajouté */}
      <div className="wrapper">
        <SignInForm />
        <div className="hero">
          <img src={hero} alt="office" />
          <p className="hero-caption">
            Your path to getting the data results you need.
          </p>
        </div>
      </div>
    </>
  );
}
