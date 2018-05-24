import { Controller, Param, Body, Get, Post, Ctx, UploadedFile } from 'routing-controllers';
import { Container, Inject } from 'typedi';
import { UploadModel } from '../models/IndexUploadModel';
import { IIndexUploadService } from '../interface/services/IIndexUploadService';
import { writeFileService } from '../common/writeFile/writeFileService';
import { cookieService } from '../common/messageCookie/cookieService';
const util = require('heibao-utils');
const writeFile = new writeFileService();
const CookieService = new cookieService();
/**
 * 首页上传相关控制器
 * @class
 */

@Controller('/api')

export class IndexUpload {
  /**
   * 首页上传服务实例对象
   */
  @Inject('IndexUploadService')
  indexServiceInstance: IIndexUploadService;

  /**
   * 注册
   * @param registerModel 准备注册的用户实体
   */
  @Post('/register')
  async registerAction(@Body() registerModel: UploadModel.RegisterModule, @Ctx() context: any): Promise<any> {
    let isNumber = Object.prototype.toString;
    let result = await this.indexServiceInstance.register(registerModel);
    if (isNumber.call(result) === '[object Number]') {
      context.cookies.set("user_id", result)
      return {
        upload_user_id: result,
        code: 10000,
        message: '注册成功'
      }
    } else if (isNumber.call(result) === '[object Boolean]') {
      return {
        code: 20001,
        message: '用户已注册'
      }
    }
  }
  /**
   * 登录
   * @param loginModel 登录用户实体
   */
  @Post('/login')
  async loginAction(@Body() loginModel: UploadModel.LoginModel, @Ctx() ctx: any): Promise<any> {
    let result = await this.indexServiceInstance.login(loginModel);
    if (util.isEmptyObject(result)) {
      return {
        code: 20001,
        message: '用户不存在，请注册'
      }
    } else {
      for (var i in result) {
        var id = result[i].id;
      }
      ctx.cookies.set('user_id', id, {
        httpOnly: false
      })
      return {
        code: 10000,
        message: '登录成功'
      }
    }
  }
  /**
   * 上传
   * @param uploadModel 上传数据实体
   */
  @Post('/upload')
  async uploadAction(@UploadedFile("filename") file: any, @Ctx() ctx: any): Promise<any> {
    let writeMessage = await writeFile.writeFileHandler(file);
    console.log(writeMessage);
    console.log(`ctx --------> ${JSON.stringify(ctx.request.header.cookie)}`);
    let user_id = CookieService.getCookie('user_id', ctx.request.header.cookie);
    if (writeMessage.code === 10000) {
      let uploadConfig: any = {
        user_id: user_id,
        image_url: writeMessage.url,
        update_time: util.dateFormat('yyyy/MM/dd hh:mm:ss', new Date())
      }
      let result = await this.indexServiceInstance.upload(uploadConfig);
      console.log(`controllers层 上传图片接口返回的数据${JSON.stringify(result)}`)
      if (result) {
        return {
          code: 10000,
          message: '上传成功'
        }
      } else {
        return {
          code: 20001,
          message: '上传失败'
        }
      }
    }
  }
}