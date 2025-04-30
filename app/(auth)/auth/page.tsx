import Image from "next/image";
import AuthForm from "../components/auth-form";

export default function Auth() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-white lg:px-10">
      {/* Image Section */}
      <div className="w-full md:w-1/2 hidden md:block relative min-h-[250px] md:min-h-screen overflow-hidden animate-upDown">
        <Image
          src="/images/bitcoin.png"
          alt="Cryptocurrency professional"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
