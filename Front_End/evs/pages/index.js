import { useEffect, useState } from "react/cjs/react.development";
import { useRouter } from "next/router";
import { setCookies, removeCookies } from "cookies-next";
const SHA256 = require("crypto-js/sha256");
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import Image from "next/image";
import logo from "../public/logo.png";

export default function Home() {
  const [obj, setObj] = useState({});
  const [login, setLogin] = useState(true);
  const [na, setNa] = useState(false);

  const route = useRouter();
  useEffect(() => {
    removeCookies("user");
    removeCookies("login");
    removeCookies("signin");
  }, []);

  const LogInNow = () => {
    if (!obj.email && !obj.password) return;
    setNa(true);
    const hash = SHA256(obj.password).toString();
    setCookies("login", { email: obj.email, password: hash });
    route.push("/dashboard");
  };
  const SignInNow = () => {
    if (!obj.email && !obj.password && !obj.name) return;
    setNa(true);
    const hash = SHA256(obj.password).toString();
    setCookies("signin", {
      name: obj.name,
      email: obj.email,
      password: hash,
    });
    route.push("/dashboard");
  };

  const LoginCard = () => {
    return (
      <>
        <input
          className="w-4/5 h-8 font text-xl outline-none my-2 border-b-2 border-blue-400"
          type="text"
          placeholder="email"
          value={obj.email || ""}
          onChange={(e) => {
            const email = e.target.value;
            const o = { ...obj };
            o.email = email;
            setObj(o);
          }}
        />
        <input
          className="w-4/5 h-8 font text-xl outline-none my-2 border-b-2 border-blue-400"
          type="password"
          placeholder="password"
          value={obj.password || ""}
          onChange={(e) => {
            const password = e.target.value;
            const o = { ...obj };
            o.password = password;
            setObj(o);
          }}
        />
        <button
          className=" my-2 p-2 text-white bg-blue-400 rounded-md"
          onClick={LogInNow}
        >
          Log-in
        </button>
      </>
    );
  };
  const SignInCard = () => {
    return (
      <>
        <input
          className="w-4/5 h-8 font text-xl outline-none my-2 border-b-2 border-blue-400"
          type="text"
          placeholder="Full Name"
          value={obj.name || ""}
          onChange={(e) => {
            const name = e.target.value;
            const o = { ...obj };
            o.name = name;
            setObj(o);
          }}
        />
        <input
          className="w-4/5 h-8 font text-xl outline-none my-2 border-b-2 border-blue-400"
          type="text"
          placeholder="email"
          value={obj.email || ""}
          onChange={(e) => {
            const email = e.target.value;
            const o = { ...obj };
            o.email = email;
            setObj(o);
          }}
        />
        <input
          className="w-4/5 h-8 font text-xl outline-none my-2 border-b-2 border-blue-400"
          type="password"
          placeholder="password"
          value={obj.password || ""}
          onChange={(e) => {
            const password = e.target.value;
            const o = { ...obj };
            o.password = password;
            setObj(o);
          }}
        />
        <input
          className="w-4/5 h-8 font text-xl outline-none my-2 border-b-2 border-blue-400"
          type="password"
          placeholder="confirm-password"
          value={obj.cpass || ""}
          onChange={(e) => {
            const cpass = e.target.value;
            const o = { ...obj };
            o.cpass = cpass;
            setObj(o);
          }}
        />
        <button
          className=" my-2 p-2 text-white bg-blue-400 rounded-md"
          onClick={SignInNow}
        >
          Sign-In
        </button>
      </>
    );
  };

  const loading = () => {
    if (na) return <Loading />;
  };

  return (
    <Layout title="EVS">
      {loading()}
      <div className=" flex w-screen h-screen">
        <div className="w-2/5 flex items-center justify-center">
          <div className="w-3/4 h-2/5">
            <Image
              src={logo}
              alt="LOGO"
              width="15px"
              height="10px"
              layout="responsive"
            />
          </div>
        </div>
        <div className="w-3/5 bg-blue-400 flex flex-col justify-center items-center ">
          <div className="w-11/12 bg-white py-2 shadow-lg flex flex-col justify-center items-center rounded-md ">
            {login ? LoginCard() : SignInCard()}
          </div>
          <p
            className=" my-2 text-lg cursor-pointer text-white"
            onClick={() => {
              setLogin(!login);
              setObj({});
            }}
          >
            {login ? `don't have an account?` : `already have an account?`}
          </p>
        </div>
      </div>
    </Layout>
  );
}
