import { Inter } from '@next/font/google';
import { Button, Checkbox, Form, Input, message } from "antd";
import clsx from 'clsx';
import Head from 'next/head';
import { Fragment, useEffect, useState } from "react";
import ICredentials from '../interfaces/ICredentials';
import styles from "../styles/Home.module.css";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [credentials, setCredentials] = useState<ICredentials>();
  const [loading, setLoading] = useState<boolean>(false);

  const getCredentials = async () => {
    setLoading(true);
    fetch('/api/credentials', {
      method: 'GET',
    }).then(async (response) => {
      const data = await response.json();
      setCredentials(data);
    }).catch(() => {
      message.error('Failed to load app credentials?.');
    }).finally(() => {
      setLoading(false);
    })
  }

  const saveCredentials = async (values: any) => {
    setLoading(true);
    fetch('/api/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    }).then(async (response) => {
      const data = await response.json();
      setCredentials(data.credentials);

      window.open(data.authorizationUrl, '_blank');
    }).catch(() => {
      message.error('Failed to load app credentials.');
    }).finally(() => {
      setLoading(false);
    })
  }

  useEffect(() => {
    getCredentials();

    return () => {

    }
  }, []);

  return (
    <>
      <Head>
        <title>Shopify oauth bridge</title>
        <meta name="description" content="Generate an authentication URL for the development of Shopify application in a local environment" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={clsx([inter.className, styles.main, "flex flex-col justify-center items-center bg-gray-100 w-screen min-h-screen overflow-hidden"])}>
        <div className='w-full sm:max-w-lg flex flex-col items-center justify-center'>
          <div className='flex flex-col gap-10 p-8 shadow-3xl bg-white rounded-lg w-full'>
            <div className='flex flex-col'>
              <div className='text-2xl font-bold capitalize'>Shopify App's local authentication</div>
              <div className='text-lg'>Generate authenticated URL for Shopify embedded app in local environemnt.</div>
            </div>
            {credentials ? <Form layout='vertical' onFinish={saveCredentials} initialValues={{
              client_id: credentials?.client_id,
              shop: credentials?.config?.shop,
              redirect_uri: credentials?.config?.redirect_uri ?? 'http://localhost:3000',
              scopes: credentials?.config?.scopes ?? 'write_products',
              embedded: credentials?.config?.embedded ?? true,
            }}>
              {credentials?.appSecrets === false ?
                <Fragment>
                  <Form.Item name="client_id" label="APP CLIENT ID" rules={[{ required: true, message: 'CLIENT ID is required' }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="client_secret" label="APP CLIENT SECRET" rules={[{ required: true, message: 'CLIENT SECRET is required' }]}>
                    <Input.Password />
                  </Form.Item>
                </Fragment> : <></>}
              <Form.Item name="shop" label="Shop" rules={[{ required: true, message: 'The shop name is required' }]}>
                <Input addonAfter={<span className='font-bold'>{`.${process.env.NEXT_PUBLIC_SHOPIFY_APP_DOMAIN!}`}</span>} />
              </Form.Item>
              <Form.Item name="scopes" label="Scopes" rules={[{ required: true, message: 'The scopes are required' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="redirect_uri" label="Local app URL" rules={[{ required: true, message: 'The local app URL is required' }]}>
                <Input />
              </Form.Item>
              <Form.Item name="embedded" rules={[{ required: true, message: 'Embedded property is required' }]} valuePropName="checked">
                <Checkbox>Embedded application</Checkbox>
              </Form.Item>
              {credentials?.authenticatedUrl ? <div className="bg-blue-50 border-blue-500 border my-8 p-6 rounded-2xl flex flex-col gap-3 max-w-full">
                <div className="font-bold capitalize">Curent session URL</div>
                <a href={credentials.authenticatedUrl} target="_blank" rel="noreferrer" className='break-all'>{credentials.authenticatedUrl}</a>
              </div> : <></>}
              <div className='flex items-center justify-center gap-6'>
                <Button danger={typeof credentials?.authenticatedUrl === "string"} size='large' loading={loading} type="primary" htmlType="submit">
                  {credentials?.authenticatedUrl ? <span>Revalidate</span> :
                    <span>Login</span>}
                </Button>
              </div>
            </Form> :
              <AiOutlineLoading3Quarters className='text-3xl text-green-500 animate-spin' />}
          </div>
        </div>
      </main>
    </>
  )
}
