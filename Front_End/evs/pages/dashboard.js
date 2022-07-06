import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react/cjs/react.development";
import distinctColors from "distinct-colors";
import "chart.js/auto";
import { Doughnut } from "react-chartjs-2";
import Link from "next/link";
import { setCookies, getCookies, removeCookies } from "cookies-next";
import Layout from "../components/Layout";
import Loading from "../components/Loading.js";
import url from "../url.js";
import Image from "next/image";
import logo from "../public/logo.png";

export default function Dashboard({ data, msg }) {
  const route = useRouter();
  const [na, setNa] = useState(false);

  if (!data) {
    const a = () => {
      alert(msg);
      route.push("/");
    };
    return <div>{a()}</div>;
  }

  const list = {
    CT: [],
    NR: [],
    WR: [],
  };

  for (const v of data.votings) {
    const et = new Date(v.endTime);

    if (et.getTime() > Date.now()) {
      list.CT.push(v);
    } else {
      if (v.result.length === 0) {
        list.NR.push(v);
      } else {
        let totalCounts = 0;
        const patten = distinctColors({
          count: v.result.length,
          chromaMin: 10,
          lightMin: 50,
        });

        for (let i = 0; i < v.result.length; i++) {
          totalCounts = totalCounts + v.result[i].count;
          v.result[i].color = patten[i].hex();
        }

        v.totalCounts = totalCounts;

        list.WR.push(v);
      }
    }
  }

  const optFromId = (index, id) => {
    return list.WR[index].options.find((o) => o.id === id);
  };

  const GenResult = async (id) => {
    setNa(true);

    const response = await axios.get(`${url}/result`, {
      params: {
        voteId: id,
      },
    });

    if (response.data.success === true) {
      window.location.reload();
    } else {
      alert("Something went wrong.");
      setNa(false);
    }
  };

  const CTRenders = (index) => {
    const st = new Date(list.CT[index].startTime);
    if (st.getTime() > Date.now()) {
      return (
        <div className="w-full flex justify-end font-bold text-sm">
          <div>
            {"The voting will "}
            <span className="text-green-700">{" Start "}</span>
            {" at "}
            {st.toLocaleString(undefined, {
              timeZone: "Asia/Kolkata",
            })}
          </div>
        </div>
      );
    } else if (list.CT[index].didVote === false) {
      return (
        <div className="w-full flex justify-end">
          <Link
            href={{
              pathname: "/voting",
              query: { id: list.CT[index].id },
            }}
          >
            <a className="p-2 bg-blue-400 rounded-md  text-white m-2">
              Vote now
            </a>
          </Link>
        </div>
      );
    }
  };

  const CTVotings = (index) => {
    return (
      <div
        key={index}
        className="w-11/12 mx-4 my-2 p-2 rounded-lg bg-slate-200 shadow-lg self-start"
      >
        <div className="w-full flex justify-between font-bold text-sm">
          <div>
            <span className="text-red-700">{"END'S AT : "}</span>
            {new Date(list.CT[index].endTime).toLocaleString(undefined, {
              timeZone: "Asia/Kolkata",
            })}
          </div>
        </div>
        <div className="w-full flex justify-between font-bold text-lg">
          <div>{list.CT[index].title}</div>
        </div>
        {CTRenders(index)}
      </div>
    );
  };

  const NRVotings = (index) => {
    return (
      <div
        key={index}
        className="w-11/12 mx-4 my-2 p-2 rounded-lg bg-slate-200 shadow-lg self-start"
      >
        <div className="w-full flex justify-start font-bold text-sm text-green-700">
          <div>Time is Up.</div>
        </div>
        <div className="w-full flex justify-start font-bold text-lg">
          <div>{list.NR[index].title}</div>
        </div>
        <div className="w-full flex justify-end">
          <button
            target={"_blank"}
            className="p-2 bg-blue-400 rounded-md  text-white m-2"
            onClick={async () => await GenResult(list.NR[index].id)}
          >
            Genrate Result
          </button>
        </div>
      </div>
    );
  };

  const resultCard = (index) => {
    const result = list.WR[index].result.map((opt, i) => {
      const o = optFromId(index, opt.id);
      return (
        <table key={i} className=" my-1 w-3/4">
          <tr>
            <td className="w-1/5">
              <div className="h-20 w-20 bg-slate-400 rounded-md">
                <img
                  src={`${url}${o.imgUrl}`}
                  alt=""
                  className=" w-full h-full object-fill rounded-md"
                />
              </div>
            </td>
            <td className="w-3/5 h-fit my-2 ml-2 break-words border-2 border-blue-400 rounded-md">
              {o.description}
            </td>
            <td
              className="w-1/5 text-gray-800 text-2xl font-mono font-extrabold mr-4 p-2"
              style={{ backgroundColor: opt.color }}
            >
              {opt.count}
            </td>
          </tr>
        </table>
      );
    });
    return (
      <div className="w-full flex flex-col items-center justify-evenly my-2">
        <table className="my-1 w-3/4">
          <tr>
            <td className="w-1/5 border-2 border-blue-400 font-bold">
              Options
            </td>
            <td className="w-3/5 border-2 border-blue-400 font-bold">
              Description
            </td>
            <td className="w-1/5 border-2 border-blue-400 font-bold">Counts</td>
          </tr>
        </table>
        {result}
      </div>
    );
  };

  const Pie1 = (index) => {
    const numbers = [];
    const colors = [];
    list.WR[index].result.map((e) => {
      numbers.push(e.count);
      colors.push(e.color);
    });
    const d = {
      datasets: [
        {
          data: numbers,
          backgroundColor: colors,
        },
      ],
    };

    return (
      <div className="w-full h-fit flex items-center justify-center">
        <div className="w-40 h-40 ">
          <Doughnut data={d} width="100" height="100" />
        </div>
      </div>
    );
  };

  const Pie2 = (index) => {
    const stats = {
      a: list.WR[index].totalVoters - list.WR[index].totalCounts,
      p: list.WR[index].totalCounts,
      t: list.WR[index].totalVoters,
    };
    const d = {
      datasets: [
        {
          data: [stats.a, stats.p],
          backgroundColor: ["#f87171", "#60a5fa"],
        },
      ],
    };

    return (
      <div className=" my-4 w-full h-fit flex items-center justify-evenly">
        <table className="w-2/4 text-gray-800 text-2xl font-mono font-extrabold">
          <tr>
            <td className="w-3/4 border-2 border-blue-400">Absent Voters</td>
            <td style={{ backgroundColor: "#f87171" }}>{stats.a}</td>
          </tr>
          <tr>
            <td className="w-3/4  border-2 border-blue-400">Present Voters</td>
            <td style={{ backgroundColor: "#60a5fa" }}>{stats.p}</td>
          </tr>
          <tr>
            <td className="w-3/4  border-2 border-blue-400">Total Voters</td>
            <td className="bg-blue-200">{stats.t}</td>
          </tr>
        </table>
        <div className="w-1/4 h-fit ">
          <Doughnut data={d} width="100" height="100" />
        </div>
      </div>
    );
  };

  const WRVotings = (index) => {
    return (
      <div
        key={index}
        className="w-11/12 mx-4 my-2 p-2 rounded-lg bg-slate-100 shadow-lg self-start"
      >
        <div className="w-full flex justify-end font-bold text-sm">
          <div>
            <span className="text-green-700">
              {new Date(list.WR[index].startTime).toLocaleString(undefined, {
                timeZone: "Asia/Kolkata",
              })}
            </span>
            {" - "}
            <span className="text-red-700">
              {new Date(list.WR[index].endTime).toLocaleString(undefined, {
                timeZone: "Asia/Kolkata",
              })}
            </span>
          </div>
        </div>
        <div className="w-full flex justify-start font-bold text-lg">
          <div>{list.WR[index].title}</div>
        </div>
        <div className="w-full flex flex-col">{resultCard(index)}</div>
        {Pie1(index)}
        <hr className="w-11/12 border-2 bg-slate-600 my-2 mx-4" />
        {Pie2(index)}
      </div>
    );
  };

  const Block = () => {
    if (na === true) {
      return <Loading />;
    }
  };

  return (
    <Layout title="Dashboard">
      {Block()}
      <div className="w-full my-4 flex ">
        <div className="w-1/4 h-screen px-2 flex flex-col items-center border-r-2 border-solid border-blue-400">
          <div className=" w-full h-20 my-1 flex justify-center ">
            <Image
              src={logo}
              alt="LOGO"
              width="150px"
              height="100px"
              layout="intrinsic"
            />
          </div>
          <div className="bg-blue-400 text-white w-full my-1 flex flex-col items-center shadow-lg">
            <p>{data.name.toUpperCase()}</p>
            <p>{data.email}</p>
          </div>
          <button
            className="my-2 p-2 text-white bg-blue-400 rounded-md shadow-lg"
            onClick={() => {
              removeCookies("user");
              route.push("/");
            }}
          >
            Log-Out
          </button>
        </div>
        <div className="w-3/4 px-2 flex flex-col">
          <Link href="/voting/new">
            <a
              target="_blank"
              className="mx-4 my-4 py-2 px-4 text-lg font-bold text-white bg-blue-400 rounded-full shadow-lg self-start"
            >
              Create Election
            </a>
          </Link>
          <div className="my-2 flex flex-col-reverse">
            {list.CT.map((v, i) => {
              return CTVotings(i);
            })}
          </div>
          <div className="my-2 flex flex-col-reverse">
            {list.NR.map((v, i) => {
              return NRVotings(i);
            })}
          </div>
          <hr className="w-11/12 border-2 bg-slate-600 my-2 mx-4" />
          <div className="my-2 flex flex-col-reverse">
            {list.WR.map((v, i) => {
              return WRVotings(i);
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ req, res }) {
  const cookies = getCookies({ req, res });

  const FLV = async (list) => {
    const arr = [];

    for (const v of list) {
      const r = await axios.get(`${url}/voting`, {
        data: {
          voteId: v.id,
        },
      });

      r.data.didVote = v.didVote;
      arr.push(r.data);
    }

    return arr;
  };

  if (cookies.user) {
    const userData = JSON.parse(cookies.user);

    const response = await axios.get(`${url}/user`, {
      data: { id: userData.id },
    });

    userData.votings = response.data.votings;

    setCookies("user", { ...userData }, { req, res });

    userData.votings = await FLV(userData.votings);

    return { props: { data: userData } };
  }

  if (cookies.login) {
    const login = JSON.parse(cookies.login);
    const response = await axios.get(`${url}/login`, {
      data: {
        email: login.email,
        password: login.password,
      },
    });

    removeCookies("login", { req, res });

    if (response.data.success === false) {
      return { props: { msg: response.data.msg } };
    }
    setCookies("user", { ...response.data }, { req, res });

    response.data.votings = await FLV(response.data.votings);

    return { props: { data: response.data } };
  }

  if (cookies.signin) {
    const signin = JSON.parse(cookies.signin);
    const response = await axios.post(`${url}/sign-in`, {
      name: signin.name,
      email: signin.email,
      password: signin.password,
    });

    removeCookies("signin", { req, res });

    if (response.data.success === false) {
      return { props: { msg: response.data.msg } };
    }

    setCookies("user", { ...response.data }, { req, res });
    return { props: { data: response.data } };
  }

  return { props: { msg: "login please" } };
}
