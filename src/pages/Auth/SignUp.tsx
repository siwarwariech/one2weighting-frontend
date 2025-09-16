import Header from "@/components/Header";
import SignUpForm from "@/components/Auth/SignUpForm";
import hero from "@/assets/hero.jpg";

export default function SignUp() {
  return (
    <>
      <Header />                               {/* ← ajouté */}
      <div className="wrapper">
        <SignUpForm />
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
