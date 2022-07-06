import { useState, useEffect } from "react/cjs/react.development";
import { useRouter } from "next/router";
import { getCookies } from "cookies-next";
import Layout from "../../components/Layout";
import url from "../../url";
import axios from "axios";
import CryptoFun from "../../crypto-fun.js";
import Loading from "../../components/Loading";

export default function Voting({ data, bc_url }) {
  const route = useRouter();
  const options = data.options;
  const [select, setSelect] = useState(null);
  const [secret, setSecret] = useState("");
  const [na, setNa] = useState(false);

  const uploadVote = async () => {
    if (select === null || secret === "") {
      setNa(false);
      return;
    }
    const s = secret.replace(" ", "");
    const os = CryptoFun.getOriginalSecret(s);

    const vote = {
      id: data.id,
      timestamp: Date.now(),
      optionid: options[select].id,
      address: CryptoFun.getPublicKeyOfSecret(s),
    };
    const m = CryptoFun.encrypt(os, vote);

    const response = await axios.post(`${bc_url}/transact-vote`, {
      em: {
        m: m,
        s: s,
      },
    });
    if (response.data.success === true) {
      await axios.post(`${url}/did-vote`, {
        id: data.uid,
        voteId: data.id,
      });

      alert("The vote uploaded.");
      route.back();
    } else {
      alert("Something went wrong the vote didn't uploaded.");
      setNa(false);
    }
  };

  useEffect(() => {
    async function up() {
      if (na === true) await uploadVote();
    }
    up();
  });

  const Card = (index) => {
    return (
      <div
        key={index}
        className="w-4/5 h-fit my-4 py-4 rounded-md bg-white shadow-lg flex items-center justify-between"
      >
        <div className="flex">
          <div className=" m-2 h-20 w-20 bg-slate-400 rounded-md">
            <img
              src={`${url}${options[index].imgUrl}`}
              alt=""
              className=" w-full h-full object-fill  rounded-md"
            />
          </div>
          <div className=" m-2 h-fit w-auto bg-blue-200 rounded-md">
            {options[index].description}
          </div>
        </div>
        <input
          type="radio"
          checked={select === index}
          className="m-4 scale-150 border-blue-400"
          onClick={() => {
            setSelect(index);
          }}
        />
      </div>
    );
  };

  const RenderOpts = () => {
    return options.map((v, i) => {
      return Card(i);
    });
  };
  const SubmitWithSecret = () => {
    if (select === null) return;
    return (
      <div className="w-4/5 my-2 p-2 rounded-md bg-white shadow-lg flex justify-between">
        <input
          className="w-3/4 h-8 font text-xl outline-none my-2 border-b-2 border-blue-400"
          type="text"
          value={secret}
          placeholder="Enter the Secret"
          onPaste={(e) => {
            e.preventDefault();
          }}
          onChange={(e) => {
            const v = e.target.value;
            setSecret(v);
          }}
        />
        <button
          className="m-2 p-2 bg-blue-400 rounded-md text-white"
          onClick={() => setNa(true)}
        >
          Submit Vote
        </button>
      </div>
    );
  };
  const Block = () => {
    if (na === true) {
      return <Loading />;
    }
  };

  return (
    <Layout title="Voting">
      {Block()}
      <div className=" w-screen min-h-screen mx-2 py-4 bg-slate-200 flex flex-col items-center justify-center ">
        <div className=" font-bold text-4xl text-blue-400">{data.title}</div>
        {RenderOpts()}
        {SubmitWithSecret()}
        {console.log(select)}
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ req, res, query }) {
  const cookies = getCookies({ req, res });
  const userData = JSON.parse(cookies.user);

  const id = query.id;
  const r = await axios.get(`${url}/voting`, {
    data: {
      voteId: id,
    },
  });

  r.data.uid = userData.id;

  const response = await axios.get(`${url}/rand-bc-node`);

  return {
    props: { data: r.data, bc_url: response.data.bc_url },
  };
}
